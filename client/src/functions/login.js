const login = async(params,state,functions) => {

    const loginBox = {...state.setLoginBox}
    state.setLoginBox({username: ``,password: ``,})

    const data = {
      params,
      username: params.username,
      password: params.password,
    }

    await fetch(`${state.port}/api/login`, {
        method: "post",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(async res => {
        if (res.response === `Success!`) {
          await state.setUserInfo({username: params.username, krogerLocation: res.krogerLocation})
          await state.setSearchBox(prevState => {
            const newState = {...prevState}
            newState.product.locationId = res.krogerLocation
            return newState
          })
          functions.getRecipes({username: res.username},{...state.searchBox.product,locationId: res.krogerLocation},state,functions)
        } else {
          console.log(res)
        }
      })
      .catch(e => console.log(e))
}

export default login