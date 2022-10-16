import React from 'react'

const Notification = ({state, functions, notification, index}) => {

  return (
    <div className={`notification`}>
            <p>{notification.notification}</p>
            <button className={`notificationButton`} onClick={(e) => {
                state.setNotifications(prevState => {
                    return [...prevState].filter((notification,notificationIndex) => {
                        return notificationIndex !== index
                    })
                })
            }}>X</button>
    </div>
  )
}

export default Notification