import { useParams } from 'react-router-dom'
import RequestStatusPage from '../pages/RequestStatusPage'

const RequestStatusWrapper = () => {
  const { id } = useParams()
  return <RequestStatusPage requestID={id} />
}

export default RequestStatusWrapper

