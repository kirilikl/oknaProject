import express from "express"
import { readFile, writeFile } from "node:fs/promises"

const app = express()
const PORT = process.env.PORT || 3000
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"
const ORDERS_FILE = new URL("./orders.json", import.meta.url)

app.use(express.json())

async function loadOrders() {
  try {
    return JSON.parse(await readFile(ORDERS_FILE, "utf8"))
  } catch (error) {
    if (error.code === "ENOENT") return []
    throw error
  }
}

async function saveOrders(orders) {
  await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2) + "\n")
}

const orders = await loadOrders()

// POST /api/orders — создание заказа
app.post("/api/orders", async (req, res, next) => {
  try {
    const { name, count } = req.body || {}

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Некорректное название заказа" })
    }

    if (!Number.isFinite(count) || count <= 0) {
      return res.status(400).json({ error: "Некорректное количество" })
    }

    const order = {
      id: orders.reduce((max, item) => Math.max(max, item.id), 0) + 1,
      name: name.trim(),
      count
    }

    orders.push(order)
    await saveOrders(orders)

    res.status(201).json(order)
  } catch (error) {
    next(error)
  }
})

// GET /api/orders — список заказов (только с паролем администратора)
app.get("/api/orders", (req, res) => {
  const password = req.get("x-admin-password")

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Доступ запрещен" })
  }

  res.json(orders)
})

app.use((error, req, res, next) => {
  console.error(error)
  res.status(500).json({ error: "Внутренняя ошибка сервера" })
})

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`)
})
