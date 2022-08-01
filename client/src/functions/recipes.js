const getRecipes = (filter,state,functions) => {
    fetch(`${state.port}/api/getRecipes`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filter),
    })
    .then(res => res.json())
    .then(res => {
      state.setRecipes(res)
    })
    .catch(e => console.log(e))
}

export {getRecipes}