import { createContext, useContext, useEffect, useState } from "react";
import { usePagamentoContext } from "./Pagamento";
import { UsuarioContext } from "./Usuario";

export const CarrinhoContext = createContext();
CarrinhoContext.displayName = "Carrinho";

export const CarrinhoProvider = ({children}) => {
    const [carrinho, setCarrinho] = useState([])
    const [qtdProducts, setQtdProducts] = useState(0)
    const [amountProducts, setAmountProducts] = useState(0)

    return (
        <CarrinhoContext.Provider
            value={{
                carrinho, 
                setCarrinho, 
                qtdProducts, 
                setQtdProducts,
                amountProducts,
                setAmountProducts
            }}
        >
            {children}
        </CarrinhoContext.Provider>
    )
}

export const useCarrinhoContext = () => {
    const {
        carrinho, 
        setCarrinho, 
        qtdProducts, 
        setQtdProducts,
        amountProducts,
        setAmountProducts
    } = useContext(CarrinhoContext);

    const {formaPagamento} = usePagamentoContext();
    const {saldo, setSaldo} = useContext(UsuarioContext);

    function addProduct(newProduct){
        const hasProduct = carrinho.some(item => item.id === newProduct.id);
        
        if(!hasProduct) {
          newProduct.qtd = 1;
          return setCarrinho(prev => [...prev, newProduct])
        }
        
        setCarrinho(prev => prev.map(
          item => {
            if(item.id === newProduct.id) item.qtd += 1;
            return item;
          }
        ))
    }

    function removeProduct(id){
        const product = carrinho.find(item => item.id === id);
        
        if(product && product.qtd === 1) {
          return setCarrinho(prev => prev.filter(item => item.id !== id))
        }

        if(product && product.qtd > 1) {
            setCarrinho(prev => prev.map(
                item => {
                  if(item.id === id) item.qtd -= 1;
                  return item;
                }
              ))
        }
    }

    function purchase(){
        setCarrinho([])
        setSaldo(saldo - amountProducts)
    }

    useEffect(() => {
        const {productsCount, productsTotalValue } = carrinho.reduce((contador, produto) => 
            ({
                productsCount: contador.productsCount + produto.qtd,
                productsTotalValue: contador.productsTotalValue + (produto.valor * produto.qtd)
            }), {
                productsTotalValue: 0,
                productsCount: 0
            })

        setQtdProducts(productsCount)
        setAmountProducts(productsTotalValue * formaPagamento.juros)
    }, [carrinho, setQtdProducts, setAmountProducts, formaPagamento])

    return {
        carrinho, 
        setCarrinho, 
        qtdProducts, 
        addProduct, 
        removeProduct, 
        amountProducts,
        purchase
    }
}