import { test, expect } from '@playwright/test'
import { parsearCsv, mapearColumnas, aNumero, analizarCatalogo } from '../src/lib/importarCatalogo.js'

/* El parser de planillas. Corre en Node, sin navegador: es lógica
   pura y no hace falta levantar la app para probarla.

   Los casos son los que rompen a los importadores caseros: el punto
   y coma que usa Excel en español, el BOM, las comillas escapadas, y
   la ambigüedad entre 1.234,56 y 1,234.56. */

test.describe('Importar catálogo', () => {
  test.describe('separadores', () => {
    test('punto y coma, que es lo que exporta Excel en español', () => {
      expect(parsearCsv('a;b;c\n1;2;3')[1]).toEqual(['1', '2', '3'])
    })
    test('coma y tabulación', () => {
      expect(parsearCsv('a,b,c\n1,2,3')[1]).toEqual(['1', '2', '3'])
      expect(parsearCsv('a\tb\n1\t2')[1]).toEqual(['1', '2'])
    })
  })

  test.describe('comillas', () => {
    test('una coma dentro de comillas no parte la celda', () => {
      expect(parsearCsv('a,b\n"Monitor 24"", IPS",9')[1]).toEqual(['Monitor 24", IPS', '9'])
    })
    test('un salto de línea dentro de comillas no parte la fila', () => {
      expect(parsearCsv('a,b\n"linea1\nlinea2",x')[1]).toEqual(['linea1\nlinea2', 'x'])
    })
    test('una comilla suelta en el medio es un carácter más', () => {
      /* `Monitor 24" IPS` sin entrecomillar es lo que escribe una
         planilla hecha a mano. Tomarla como apertura de comillas se
         tragaba el resto del archivo. */
      expect(parsearCsv('a;b\nMonitor 24" IPS;9')[1]).toEqual(['Monitor 24" IPS', '9'])
    })
  })

  test('el BOM de Excel no rompe el encabezado', () => {
    /* Excel antepone \uFEFF y sin quitarlo la primera columna se
       llama "\uFEFFSKU" y no matchea ningún alias. */
    expect(mapearColumnas(parsearCsv('\uFEFFSKU,Producto\n1,x')[0]).sku).toBe(0)
  })

  test('reconoce nombres de columna reales, con acentos', () => {
    const m = mapearColumnas(['Código', 'Descripción', 'Stock mínimo', 'Precio costo', 'Cant.'])
    expect([m.sku, m.name, m.reorderPoint, m.unitCost]).toEqual([0, 1, 2, 3])
  })

  test.describe('números', () => {
    test('los dos formatos dan el mismo número', () => {
      expect(aNumero('1.234,56')).toBe(1234.56)
      expect(aNumero('1,234.56')).toBe(1234.56)
    })
    test('un grupo de tres se lee como miles', () => {
      /* Caso ambiguo decidido a propósito: en datos de inventario
         "1.500" es mil quinientos mucho más seguido de lo que es 1,5,
         y leer 1,5 donde dice mil quinientos es el error más caro. */
      expect(aNumero('1.500')).toBe(1500)
      expect(aNumero('1.234.567')).toBe(1234567)
    })
    test('uno o dos dígitos después del separador es decimal', () => {
      expect(aNumero('1.5')).toBe(1.5)
      expect(aNumero('0,75')).toBe(0.75)
    })
    test('ignora el símbolo de moneda y respeta el signo', () => {
      expect(aNumero('$ 1.250')).toBe(1250)
      expect(aNumero('-13')).toBe(-13)
    })
    test('vacío y texto dan null, nunca cero', () => {
      /* Cero es un número: se sumaría y se promediaría como si
         alguien lo hubiera medido. */
      expect(aNumero('')).toBeNull()
      expect(aNumero('abc')).toBeNull()
    })
  })

  test.describe('análisis previo', () => {
    const CSV = [
      'SKU;Producto;Costo;Stock minimo;Cantidad',
      'MB-1;Monitor;190;45;60',
      'MB-1;Duplicado;10;5;5',
      ';Sin sku;1;1;1',
      'MB-2;;1;1;1',
      'MB-3;Negativo;-5;1;1',
      'MB-4;Bien;1.500,50;10;20',
    ].join('\n')

    test('separa lo que entra de lo que no, sin escribir nada', () => {
      const r = analizarCatalogo(CSV, { skusExistentes: new Set(['MB-9']) })
      expect(r.listos.map((p) => p.sku)).toEqual(['MB-1', 'MB-4'])
      expect(r.problemas).toHaveLength(4)
      expect(r.total).toBe(6)
      expect(r.listos[1].unitCost).toBe(1500.5)
    })

    test('cada problema dice de qué fila es y por qué', () => {
      const r = analizarCatalogo(CSV, { skusExistentes: new Set() })
      const motivos = r.problemas.map((p) => p.motivo).join(' | ')
      expect(motivos).toMatch(/repetido/)
      expect(motivos).toMatch(/Sin SKU/)
      expect(motivos).toMatch(/sin nombre/)
      expect(motivos).toMatch(/negativo/)
      expect(r.problemas.every((p) => p.fila >= 2)).toBe(true)
    })

    test('no pisa un SKU que ya existe', () => {
      const r = analizarCatalogo('SKU;Producto\nMB-9;Ya está', { skusExistentes: new Set(['MB-9']) })
      expect(r.listos).toHaveLength(0)
      expect(r.problemas[0].motivo).toMatch(/ya existe/)
    })

    test('exige las columnas obligatorias y lo dice', () => {
      const r = analizarCatalogo('foo;bar\n1;2')
      expect(r.listos).toHaveLength(0)
      expect(r.problemas[0].motivo).toMatch(/Faltan columnas/)
    })

    test('un archivo vacío no revienta', () => {
      expect(analizarCatalogo('').problemas).toHaveLength(1)
      expect(analizarCatalogo('SKU;Producto').listos).toHaveLength(0)
    })
  })
})
