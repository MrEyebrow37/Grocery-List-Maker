import {useState} from 'react'
import Product from './kroger-product'
import RecipeProduct from './recipe-product'

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
        <div className={`recipe`}>
            <p className={`recipeTitle cursor-pointer`} onClick={(e) => {
                state.setSelectedRecipe(recipe)
                functions.toggleModal(e,`recipeModal`)
            }}>{recipe.title}</p>
            <p className={`recipeTotalCost`}>Total cost: ${Number(totalCost.toFixed(2))}</p>
            <div className={`recipeServings`}>
                <p>Servings: {recipe.servings}</p>
                <button onClick={(e) => {handleServingsChange(e,`subtract`)}}>-</button>
                <button onClick={(e) => {handleServingsChange(e,`add`)}}>+</button>
                <p className={`extraInfo`} title={`Cost per Serving`}>&#63;</p>
                <p>CPS: ${(totalCost/recipe.servings).toFixed(2)}</p>
            </div>
            <button onClick={(e) => {functions.deleteRecipes(e,recipe)}}>Delete</button>
            <div className={`productSpacer`}></div>
        </div>
    )
}

export default Recipe