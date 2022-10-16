const displayNotification = (notificationText,state) => {
    state.setDisplayNotificationText(notificationText)
    const target = document.querySelector(`#displayNotification`)
    target.classList.remove(`hide`)
    target.classList.add(`displayNotification`)
}


export default displayNotification