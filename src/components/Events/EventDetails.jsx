import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import ErrorBlock from '../UI/ErrorBlock.jsx';

import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';

export default function EventDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const { data: eventDetails, isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id})
  });

  const { mutate } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events']});
      navigate('/events');
    }
  });

  function handleDelete() {
    mutate({ id: params.id })
  }

  let content;

  if(isPending) {
    content = <div id="event-details-content" className="center">
      <p>Fetching event data...</p>
    </div>
  }

  if(isError) {
    content = <div id="event-details-content" className="center">
      <ErrorBlock title="Failed to load event" message={error.info?.message || 'Failed to fetch event data. Please try again later.'}></ErrorBlock>
    </div>
  }

  if(eventDetails) {
    const formattedDate = new Date(eventDetails.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    content = <>
        <header>
          <h1>{eventDetails.title}</h1>
          <nav>
            <button onClick={handleDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${eventDetails.image}`} alt={eventDetails.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{eventDetails.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {eventDetails.time}</time>
            </div>
            <p id="event-details-description">{eventDetails.description}</p>
          </div>
        </div>
    </>
  }

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {content}
      </article>
    </>
  );
}
