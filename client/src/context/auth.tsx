import Axios from 'axios'
import { createContext, useContext, useEffect, useReducer } from 'react'
import { User } from '../types'

// this way of using context/ design pattern comes from 
// https://kentcdodds.com/blog/how-to-use-react-context-effectively
// sandbox example https://codesandbox.io/s/react-codesandbox-je6cc?file=/src/count-context.js
interface State {
  authenticated: boolean
  user: User | undefined
  loading: boolean
}

interface Action {
  type: string
  payload: any
}

const StateContext = createContext<State>({
  authenticated: false,
  user: null,
  loading: true,
})

const DispatchContext = createContext(null)

const reducer = (state: State, { type, payload }: Action) => {
  switch (type) {
    case 'LOGIN':
      return {
        ...state,
        authenticated: true,
        user: payload,
      }
    case 'LOGOUT':
      return { ...state, authenticated: false, user: null }
    case 'STOP_LOADING':
      return { ...state, loading: false }
    default:
      throw new Error(`Unknow action type: ${type}`)
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, defaultDispatch] = useReducer(reducer, {
    user: null,
    authenticated: false,
    loading: true,
  })
 
//   custom dispatch and adds type and payload as an object it to an object
  const dispatch = (type: string, payload?: any):void =>
    defaultDispatch({ type, payload })

    // runs
  useEffect(() => {
    async function loadUser() {
      try {
        //   fetch user data
        const res = await Axios.get('/auth/me')
        dispatch('LOGIN', res.data)
      } catch (err) {
        console.log(err)
      } finally {
        dispatch('STOP_LOADING')
      }
    }
    loadUser()
  }, [])

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  )
}

export const useAuthState = () => useContext(StateContext)
export const useAuthDispatch = () => useContext(DispatchContext)
