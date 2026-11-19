import { useState } from 'react'
import './App.css'

function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [orders, setOrders] = useState([])

  async function handleSubmit(event){
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        name: data.name,
        count: +data.count
      })
    })

    if(!response.ok) {throw new Error(`Ошибка отправки данных на сервер ${response.status}`)}

    const result = await response.json()
    console.log(`${result}`)
    form.reset()
  }

  async function openAdmin() {
    const password = prompt("Введите пароль!")

    if (!password) throw new Error("Введите пароль")

    const response = await fetch("/api/orders", {
      headers:{
        "x-admin-password" : password
      }
    })

    if(!response.ok) throw new Error("Доступ запрещен")

    const data = await response.json()
    setIsAdmin(true)
    setOrders(data)
  }

  if(isAdmin){
    return(
      <>
        <button onClick={()=>{setIsAdmin(false)}}>Вернуться назад</button>
        {orders.map((orders, index)=>(
          <div key={index}>
            <p>Номер заказа {index+1}</p>
            <p>Название {orders.name}</p>
            <p>Количество {orders.count}</p>
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      <a href="#admin" onClick={openAdmin}>Админка</a>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input name="name"/>
        <input name="count" type="number"/>
        <button>Отправить</button>
      </form>
    </>
  )
}

export default App
