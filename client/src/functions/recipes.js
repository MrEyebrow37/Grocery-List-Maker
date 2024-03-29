const getRecipes = (filter,params,state,functions) => {
    fetch(`${state.port}/api/getRecipes`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({filter: filter,params: params}),
    })
    .then(res => res.json())
    .then(res => {
      state.setRecipes(res)
    })
    .catch(e => console.log(e))
}

export {getRecipes}