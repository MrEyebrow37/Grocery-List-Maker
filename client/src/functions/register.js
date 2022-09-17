const register = async(params,state,functions) => {

    state.setRegisterBox({username: ``,password: ``,})

    const data = {
      params,
      username: params.username,
      password: params.password,
    }

    await fetch(`${state.port}/api/register`, {
        method: "post",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(res => {
        console.log(res)
      })
      .catch(e => console.log(e))
}

export default register