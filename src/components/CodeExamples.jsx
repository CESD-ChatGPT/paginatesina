import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CodeExamples() {
  const [copied, setCopied] = useState(null)

  const examples = [
    {
      name: 'Python',
      language: 'python',
      code: `import stockai

client = stockai.Client(api_key="sk_live_...")

# Predecir demanda para próximos 30 días
forecast = client.predict_demand(
    product_id="SKU_001",
    days=30
)

# Obtener recomendación de reorden
suggestion = client.get_reorder_suggestion(
    product_id="SKU_001",
    current_stock=150
)

print(f"Cantidad recomendada: {suggestion.quantity}")
print(f"Confianza: {suggestion.confidence}%")`,
    },
    {
      name: 'JavaScript',
      language: 'javascript',
      code: `import StockAI from 'stockai-sdk';

const client = new StockAI({
  apiKey: 'sk_live_...'
});

// Consultar inventario en tiempo real
const inventory = await client.getInventory({
  warehouse: 'MAIN',
  category: 'electronics'
});

// Generar alertas inteligentes
const alerts = await client.generateAlerts({
  threshold: 'low',
  priority: 'high'
});

console.log(\`Items bajo stock: \${alerts.length}\`);`,
    },
    {
      name: 'Java',
      language: 'java',
      code: `import com.stockai.client.*;

public class StockAIExample {
  public static void main(String[] args) {
    StockAIClient client = new StockAIClient(
      "sk_live_..."
    );

    // Obtener análisis de inventario
    InventoryAnalysis analysis = client
      .analyzeInventory("WAREHOUSE_001");

    // Aplicar optimizaciones con IA
    OptimizationResult result = client.optimize(
      analysis,
      new AIConfig().setLevel("advanced")
    );

    System.out.println("Costo reducido: \$" +
      result.getSavings());
  }
}`,
    },
    {
      name: 'C#',
      language: 'csharp',
      code: `using StockAI;

class Program {
  static async Task Main() {
    var client = new StockAIClient("sk_live_...");

    // Consultar predicción de demanda
    var forecast = await client
      .GetDemandForecast(new ForecastRequest {
        ProductId = "SKU_002",
        Horizon = 60,
        Confidence = 0.95
      });

    foreach (var prediction in forecast.Predictions) {
      Console.WriteLine($"Día {prediction.Day}: " +
        $"{prediction.Quantity} unidades");
    }
  }
}`,
    },
    {
      name: 'PHP',
      language: 'php',
      code: `<?php
require_once 'vendor/autoload.php';

use StockAI\\Client;
use StockAI\\Config;

$config = new Config(['api_key' => 'sk_live_...']);
$client = new Client($config);

// Sincronizar con APIs externas
$sync = $client->syncWithShop([
    'platform' => 'shopify',
    'store_url' => 'mystore.myshopify.com'
]);

echo "Productos sincronizados: " . count($sync);
?>`,
    },
    {
      name: 'SQL',
      language: 'sql',
      code: `-- Query optimizada con IA
SELECT
  p.product_id,
  p.name,
  ROUND(ai.predicted_demand, 0) as predicted_qty,
  i.current_stock,
  CASE
    WHEN i.current_stock < ai.reorder_point
    THEN 'URGENT'
    ELSE 'OK'
  END as status
FROM products p
JOIN ai_predictions ai ON p.product_id = ai.product_id
JOIN inventory i ON p.product_id = i.product_id
WHERE ai.confidence > 0.9
ORDER BY ai.reorder_point DESC;`,
    },
  ]

  const copyToClipboard = (code, index) => {
    navigator.clipboard.writeText(code)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <section id="code" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Integración Simple
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Soportamos múltiples lenguajes de programación para que se integre con tu stack
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {examples.map((example, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4">
                <h3 className="text-white font-bold text-lg">{example.name}</h3>
              </div>
              <div className="bg-gray-900 p-4 relative">
                <pre className="text-gray-100 text-xs overflow-x-auto font-mono leading-relaxed">
                  <code>{example.code}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(example.code, index)}
                  className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded transition-colors"
                  title="Copiar código"
                >
                  {copied === index ? (
                    <Check size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-blue-50 rounded-lg p-8 border border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Documentación Completa
          </h3>
          <p className="text-gray-600 mb-6">
            Accede a nuestra documentación detallada con ejemplos, guías de integración y referencias de API.
          </p>
          <button className="btn-primary">
            Ver Documentación
          </button>
        </div>
      </div>
    </section>
  )
}
