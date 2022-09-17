import {useState} from 'react'
import Product from './kroger-product'
import RecipeProduct from './kroger-product-recipes'

const Recipe = ({recipe,state,functions}) => {

    // console.log(recipe)
    
    const totalCost = Object.values(recipe.products).reduce((prev,curr) => {
        return prev + Number((curr.sizes.find(size => size.size === curr.sizeInRecipe).pricePerThisSize*curr.quantityInRecipe).toFixed(2))
        // return Number(prev) + Number(curr.quantityInRecipe)*Number(curr.krogerInfo.items[0].price.regular) This is total price of full item
    },0)

    const handleServingsChange = (e,action) => {
        state.setRecipes(prev => {
            const newState = [...prev]
            const foundRecipe = newState.find(stateRecipe => stateRecipe._id === recipe._id)
            foundRecipe.update = true
            if (action === `add`) {
                foundRecipe.servings = foundRecipe.servings+1
            } else {
                foundRecipe.servings = foundRecipe.servings-1
            }
            return newState
        })
    }

    return (
        <details>
            <summary>
                <p>{recipe.title}</p>
                <p>Total cost: ${Number(totalCost.toFixed(2))}</p>
                <p>Servings: {recipe.servings}</p>
                <button onClick={(e) => {handleServingsChange(e,`subtract`)}}>-</button>
                <button onClick={(e) => {handleServingsChange(e,`add`)}}>+</button>
                <p>Cost per serving: ${(totalCost/recipe.servings).toFixed(2)}</p>
                <button onClick={(e) => {functions.deleteRecipes(e,recipe)}}>Delete</button>
            </summary>
            {Object.values(recipe.products).map((product,index) => {
                return <RecipeProduct recipe={recipe} product={product} state={state} functions={functions} key={index}></RecipeProduct>
            })}
        </details>
    )
}

export default Recipe