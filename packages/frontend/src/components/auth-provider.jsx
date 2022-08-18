import {useQuery} from "urql";
import {Navigate, Outlet} from "react-router-dom";
import {createContext} from "react";

const AuthContext = createContext(null)

export function WithAuth() {
  const { data, fetching, error } = useQuery({
    query: /* GraphQL */ `
      query {
         users {
          id, username
        }
      }
    `,
  })
  
  if (error) {
    return <Navigate to="/login" replace />
  }
  
  if (fetching) {
    return null
  }

  return (
    <AuthContext.Provider value={data?.users?.[0]}><Outlet /></AuthContext.Provider>
  )
}
