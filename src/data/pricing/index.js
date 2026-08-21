/* Punto único de conexión de la capa de valorización — igual que
   `inventoryService` en inventory.js, la UI solo debe importar esto. */
import { getProductValuation, getDepotValorization, CONFIDENCE_LABEL, CONFIDENCE_TOKEN } from './valuation'
import { CustomProvider } from './providers'
import { inventoryService } from '../inventory'

export { CONFIDENCE_LABEL, CONFIDENCE_TOKEN }

export const pricingService = {
  getDepotValorization,
  async getProductValuationBySku(sku) {
    const rows = await inventoryService.getStockRows()
    const row = rows.find((r) => r.sku === sku)
    if (!row) throw new Error(`No se encontró el SKU ${sku}.`)
    return getProductValuation(row)
  },
  setCustomPrice: (sku, price, currency) => CustomProvider.set(sku, price, currency),
}
