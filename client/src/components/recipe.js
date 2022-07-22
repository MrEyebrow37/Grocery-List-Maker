import {useState,useEffect} from 'react'
import Product from './kroger-product'

const Recipe = ({recipe,state,functions}) => {
    const [servings, setServings] = useState(6)
    //todo set servings in initial recipe creation
    
    if (recipe) {
        const totalCost = Object.values(recipe.products).reduce((prev,curr) => {
            return Number(prev) + Number(curr.quantityInRecipe)*Number(curr.items[0].price.regular)
        },0)
    
    
        const incrementServings = () => {
            setServings(prev => prev+1)
        }
    
        const decrementServings = () => {
            setServings(prev => prev-1)
        }
    
        return (
            <details>
                <summary>
                    <p>{recipe.title}</p>
                    <p>Total cost: ${Number(totalCost.toFixed(2))}</p>
                    <p>Servings: {servings}</p>
                    <button onClick={() => {decrementServings()}}>-</button>
                    <button onClick={() => {incrementServings()}}>+</button>
                    <p>Cost per serving: ${(totalCost/servings).toFixed(2)}</p>
                </summary>
                {Object.values(recipe.products).map((product,index) => {
                    return <Product product={product} state={state} functions={functions} key={index}></Product>
                })}
            </details>
        )
    } else {
        return <p>Sorry, no recipes found</p>
    }

}

export default Recipe