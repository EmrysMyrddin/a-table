import {useQuery} from "urql";
import {Navigate, Outlet, useNavigate} from "react-router-dom";
import {createContext, useContext, useEffect} from "react";

const AuthContext = createContext(null)

export function WithAuth() {
  const navigate = useNavigate()
  const [{ data, fetching, error }] = useQuery({
    query: /* GraphQL */ `
      query {
         me {
          id, username
        }
      }
    `,
  })
  
  useEffect(() => {
    if(error) {
      localStorage.removeItem("token")
      navigate("/login", {replace: true})
    }
  }, [error])
  
  if (error) {
    return null
  }
  
  if (fetching) {
    return null
  }
  
  return (
    <AuthContext.Provider value={data?.me}><Outlet /></AuthContext.Provider>
  )
}

export function useCurrentUser() {
  return useContext(AuthContext)
}
