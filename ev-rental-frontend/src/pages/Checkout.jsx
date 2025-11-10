import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/fetchClient'


export default function Checkout() {
    const { state } = useLocation()
    const rental = state?.rental
    const nav = useNavigate()


    async function onPay() {
        try {
            // If backend has payments.create -> call it; otherwise simulate
            const res = await api.request('/payments', { method: 'POST', body: JSON.stringify({ rental_id: rental?.rental_id, amount: rental?.amount || 1000, method: 'card' }) })
            alert('Payment result: ' + JSON.stringify(res))
            nav('/')
        } catch (e) {
            alert('Payment failed: ' + (e?.message || JSON.stringify(e)))
        }
    }


    if (!rental) return <div>No rental in progress</div>
    return (
        <div>
            <h2>Checkout</h2>
            <p>Rental id: {rental.rental_id}</p>
            <p>Amount: {rental.amount || 'TBD'}</p>
            <button onClick={onPay}>Pay online (simulate)</button>
        </div>
    )
}