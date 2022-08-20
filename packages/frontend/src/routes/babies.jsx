import {useState} from "react";
import {useMutation, useQuery} from "urql";
import {Card} from '../components/card';
import {toast} from "react-toastify";
import {Modal} from "../components/modal";
import {Input} from "../components/input";
import {FloatingButton, SecondaryButton} from "../components/button";
import {Small} from "../components/text";
import {AddEventModal} from "../components/add-event-modal";
import {LastMeal} from "./baby/tracker/meals";
import {formatNumber} from "../utils";
import {trackerQueriesContext} from "./baby/tracker/tracker";
import {format} from "date-fns";

export function BabyChoiceScreen() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updatingBaby, setUpdatingBaby] = useState(null);
  const [addingEvent, setAddingEvent] = useState(null);
  const [{data}] = useQuery({query: LIST_BABIES_QUERY});
  
  if(!data) return <p className="text-center p-4"><Small>Chargement en cours</Small></p>
  
  return (
    <>
      {data?.babies?.map(baby => {
        return (
          <Card to={`/babies/${baby.id}/tracker`} key={baby.id}>
            <Card.Body>
              <Card.Title>{baby.name}</Card.Title>
              <TodayStats babyId={baby.id} />
            </Card.Body>
            <Card.Actions>
              <Card.Action onClick={() => setUpdatingBaby(baby)}>✏️ Renommer</Card.Action>
              <Card.Action onClick={() => setAddingEvent(baby)}>＋ Événement</Card.Action>
            </Card.Actions>
          </Card>
        );
      })}
      
      
      {createModalOpen && <CreateModal close={() => setCreateModalOpen(false)}/>}
      {updatingBaby && <RenameModal baby={updatingBaby} close={() => setUpdatingBaby(null)}/>}
      {addingEvent && <AddEventModal baby={addingEvent} close={() => setAddingEvent(null)}/>}
      
      <FloatingButton onClick={() => setCreateModalOpen(true)}>＋</FloatingButton>
    </>
  )
}

function TodayStats({babyId}) {
  const [{data}] = useQuery({query: TODAY_STATS_QUERY, variables: { babyId }, context: trackerQueriesContext})
  const stats = data?.baby?.daily_stats?.[0]
  const lastMeal = data?.baby?.last_meal?.[0]
  return (
    <>
      <div className="text-center"><LastMeal meal={lastMeal}/></div>
      <div className="flex gap-2 items-center justify-around mt-4 text-sm">
        <div>{stats?.meals_sum || '-'}<Small> ml</Small></div>
        <div>{stats?.meals_count || '-'} <Small> biberons</Small></div>
        <div>{stats?.meals_avg ? formatNumber(stats?.meals_avg) : '-'}<Small> ml moy.</Small></div>
      </div>
      <div className="flex gap-2 items-center justify-around mb-2 text-sm">
        <div>{stats?.purees_sum || '-'}<Small> g</Small></div>
        <div>{stats?.purees_count || '-'}<Small> pots</Small></div>
        <div>{stats?.purees_avg ? formatNumber(stats?.purees_avg) : '-'}<Small> g moy.</Small></div>
      </div>
    </>
  )
}

function CreateModal({close}) {
  const [{fetching}, createBaby] = useMutation(CREATE_BABY_MUTATION);
  
  async function onCreateBaby(form, close) {
    const {error} = await createBaby({name: form.name.value.trim()});
    if (error) toast.error(error.message);
    else {
      toast.success(`Bébé ${form.name.value} ajouté`);
      close();
    }
  }
  
  return (
    <Modal
      title="Ajouter un bébé"
      okLabel="Ajouter" loading={fetching}
      onCloseRequested={close}
      onSubmit={onCreateBaby}
    >
      <Input name="name" placeholder="Nom de votre bébé" required/>
    </Modal>
  )
}

function RenameModal({close, baby: {id, name}}) {
  const [{fetching}, updateBaby] = useMutation(UPDATE_BABY_MUTATION);
  
  async function onUpdateBaby(form) {
    const {error} = await updateBaby({name: form.name.value.trim(), id});
    if (error) toast.error(error.message);
    else {
      toast.success(`Bébé ${name} renommé en ${form.name.value}`);
      close();
    }
  }
  
  return (
    <Modal
      title={`Renommer ${name}`}
      okLabel="Renommer" loading={fetching}
      onCloseRequested={close}
      onSubmit={onUpdateBaby}
    >
      <Input name="name" placeholder="Nom de votre bébé" required/>
    </Modal>
  )
}

const CREATE_BABY_MUTATION = /* GraphQL */ `
  mutation createBaby($name: String!) {
    insert_babies_one(object: {name: $name}) {
      id
    }
  }
`

const UPDATE_BABY_MUTATION = /* GraphQL */ `
  mutation updateBaby($name: String!, $id: uuid!) {
    update_babies_by_pk(_set: {name: $name}, pk_columns: {id: $id}) {
      id, name
    }
  }
`


const LIST_BABIES_QUERY = /* GraphQL */ `
  query listBabies {
    babies {
      id, name
    }
  }
`

const TODAY_STATS_QUERY = /* GraphQL */ `
  query todayStats($babyId: uuid!) {
    baby: babies_by_pk(id: $babyId) {
      id,
      daily_stats(order_by: { day: desc }, limit: 1) {
        meals_sum, meals_avg, meals_count, purees_avg, purees_sum, purees_count
      }
      last_meal: meals(order_by: { date: desc }, limit: 1) {
        id, date, quantity
      }
    }
  }
`
