import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Metas from './pages/Metas'
import EstoqueProdutos from './pages/EstoqueProdutos'
import Promocoes from './pages/Promocoes'

export default function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/metas' element={<Metas />}/>
        <Route path='/estoque' element={<EstoqueProdutos />}/>
        <Route path='/promocoes' element={<Promocoes />}/>
      </Routes>
    </>
  )
}
