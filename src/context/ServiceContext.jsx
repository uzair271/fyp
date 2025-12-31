import { use } from "react";
import { createContext, useReducer, useEffect, useRef } from "react";

const ServiceContext = createContext();
export default ServiceContext;

const initialState = {
  requests: [],
};

const requestReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_REQUEST': {
      const newState = {
        ...state,
        requests: [
          ...state.requests,
          {
            ...action.payload,
            status: 'PENDING',
            mechanic: false,
          },
        ],
      };
      return newState;
    }

    case 'ACCEPT_REQUEST': {
      const { requestId } = action.payload;
      const updatedRequests = state.requests.map((request) => {
        if (String(request.id) === String(requestId)) {
          return {
            ...request,
            status: 'ACCEPTED',
            mechanic: true,
          };
        }
        return request;
      });
      return {
        ...state,
        requests: updatedRequests,
      };
    }

    case 'REJECT_REQUEST': {
      const { requestId } = action.payload;
      const updatedRequests = state.requests.map((request) => {
        if (String(request.id) === String(requestId)) {
          return {
            ...request,
            status: 'REJECTED',
          };
        }
        return request;
      });
      return {
        ...state,
        requests: updatedRequests,
      };
    }

    case 'START_SERVICE': {
      const { requestId } = action.payload;
      const updatedRequests = state.requests.map((request) => { 
        if (String(request.id) === String(requestId)) {
          return {
            ...request,
            status: 'IN_PROGRESS',
          };
        }
        return request;
      });
      return {
        ...state,
        requests: updatedRequests,
      };
    }

    case 'COMPLETE_REQUEST': {
      const { requestId } = action.payload;
      const updatedRequests = state.requests.map((request) => { 
        if (String(request.id) === String(requestId)) {
          return {
            ...request,
            status: 'COMPLETED',
          };
        }
        return request;
      });
      return {
        ...state,
        requests: updatedRequests,
      };
    }

    case 'INITIALIZE': {
      const initializedState = {
        ...state,
        ...action.payload,
      };
      return initializedState;
    }

    default:
      return state;
  }
};

export const ServiceProvider = ({ children }) => {
  const [serviceData, setServiceData] = useReducer(requestReducer, initialState);
  const didMountRef = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('serviceData');
      if (stored) {
        const parsed = JSON.parse(stored);
        setServiceData({
          type: 'INITIALIZE',
          payload: { requests: Array.isArray(parsed) ? parsed : [] },
        });
      }
    } catch (e) {
    }
  }, []);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    localStorage.setItem('serviceData', JSON.stringify(serviceData.requests));
  }, [serviceData.requests]);

  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <ServiceContext.Provider value={{ serviceData, setServiceData }}>
      {children}
    </ServiceContext.Provider>
  );
};
