import {Link, NavLink, Outlet, useParams} from "react-router-dom";
import {useQuery} from "urql";
import {Header} from "../components/header";
import {Small} from "../components/text";
import {FloatingButton, SecondaryButton} from "../components/button";
import {LogoutButton} from "../components/logout";
import {AddEventModal} from "../components/add-event-modal";
import {useState} from "react";
import { ReactComponent as BackIcon} from "../components/icons/back-svgrepo-com.svg";
import {LastMeal} from "./baby/tracker/meals";

export function BabyScreen() {
  const {id} = useParams();
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const [{data}] = useQuery({query: GET_BABY, variables: {id}});
  return (
    <div className="h-screen w-screen flex flex-col">
      <Header className="flex items-start justify-between">
        <Link to="/babies" className="mr-4 mt-0.5"><BackIcon className="h-9 inline-block rounded-full hover:bg-gray-100"/></Link>
        <div className="flex flex-col items-center">
          <div className="font-bold">{data?.baby?.name}</div>
          <LastMeal meal={data?.baby?.last_meal} />
        </div>
        <LogoutButton className="justify-self-end" />
      </Header>
      <nav className="flex text-center shadow-lg">
        <NavTab to={`/babies/${id}/tracker`}>Tracking</NavTab>
        <NavTab to={`/babies/${id}/graphs`}>Graphs</NavTab>
      </nav>
      <div className="flex-1 overflow-auto pt-4 pb-36">
        <Outlet />
        <FloatingButton onClick={() => setAddEventModalOpen(true)}>＋</FloatingButton>
        { addEventModalOpen && <AddEventModal open={addEventModalOpen} close={() => setAddEventModalOpen(false)} baby={data?.baby}/> }
      </div>
    </div>
  )
}

function NavTab({...props}) {
  return <NavLink className="w-full p-2 hover:bg-gray-50 nav-tab" {...props} />
}

const GET_BABY = /* GraphQL */`
  query getBaby($id: uuid!) {
    baby: babies_by_pk(id: $id) {
      id, name
      last_meal: meals(order_by: { date: desc }, limit: 1) {
        id, date, quantity
      }
    }
  }
`
