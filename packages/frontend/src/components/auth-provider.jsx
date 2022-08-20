import {useQuery} from "urql";
import {Navigate, Outlet} from "react-router-dom";
import {createContext, useContext, useEffect} from "react";

const AuthContext = createContext(null)

export function WithAuth() {
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
    }
  }, [])
  
  if (error) {
    return <Navigate to="/login" replace />
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
