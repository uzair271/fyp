import { createContext, useContext, useState, useCallback, useEffect } from 'react'

// Create the context
const AppContext = createContext(undefined)

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// App Provider Component
export const AppProvider = ({ children }) => {
  // Auth State
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    role: null,
  })

  // Services Array
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Oil Change',
      category: 'Maintenance',
      basePrice: 49.99,
      description: 'Standard oil change service',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Brake Repair',
      category: 'Repair',
      basePrice: 199.99,
      description: 'Complete brake system repair',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Tire Replacement',
      category: 'Repair',
      basePrice: 149.99,
      description: 'Tire replacement service',
      status: 'Active',
    },
  ])

  // Vehicles Array
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      userId: null,
      type: 'Sedan',
      model: 'Toyota Camry 2020',
      licensePlate: 'ABC-1234',
    },
    {
      id: 2,
      userId: null,
      type: 'SUV',
      model: 'Honda CR-V 2019',
      licensePlate: 'XYZ-5678',
    },
  ])

  // Requests Array
  const [requests, setRequests] = useState([
    {
      id: 'REQ-001',
      customerId: null,
      mechanicId: null,
      serviceId: 1,
      vehicleId: 1,
      status: 'Pending',
      urgency: 'normal',
      price: 74.99,
      distance: 25,
      createdAt: new Date().toISOString(),
    },
  ])

  // Notifications Array
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      userId: null,
      type: 'info',
      title: 'Welcome!',
      message: 'Welcome to FYP App',
      read: false,
      createdAt: new Date().toISOString(),
    },
  ])

  // Chat Messages Array
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      requestId: 'REQ-001',
      senderId: null,
      senderName: 'System',
      message: 'Chat initialized',
      timestamp: new Date().toISOString(),
      isMe: false,
    },
  ])

  // Users Array (for admin management)
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'customer',
      phone: '+1 (555) 123-4567',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'customer',
      phone: '+1 (555) 234-5678',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'mechanic',
      phone: '+1 (555) 345-6789',
      status: 'Active',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      role: 'mechanic',
      phone: '+1 (555) 456-7890',
      status: 'Active',
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.brown@example.com',
      role: 'customer',
      phone: '+1 (555) 567-8901',
      status: 'Inactive',
    },
  ])

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('user')
    const role = localStorage.getItem('userRole')

    if (token && userStr && role) {
      try {
        const user = JSON.parse(userStr)
        setAuthState({
          user,
          token,
          role,
        })
      } catch (error) {
        console.error('Error parsing user from localStorage:', error)
        // Clear invalid data
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')
      }
    }
  }, [])

  // ========== Auth Functions ==========
  const login = useCallback(async (credentials) => {
    try {
      // Placeholder API integration
      console.log('Logging in with:', credentials)
      
      // Simulate API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      // Placeholder response
      const mockResponse = {
        user: {
          id: 1,
          name: credentials.email?.split('@')[0] || 'User',
          email: credentials.email,
          role: 'customer',
        },
        token: 'mock-jwt-token',
        role: 'customer',
      }

      setAuthState({
        user: mockResponse.user,
        token: mockResponse.token,
        role: mockResponse.role,
      })

      // Store in localStorage
      localStorage.setItem('authToken', mockResponse.token)
      localStorage.setItem('user', JSON.stringify(mockResponse.user))
      localStorage.setItem('userRole', mockResponse.role)

      return mockResponse
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }, [])

  const register = useCallback(async (userData) => {
    try {
      // Placeholder API integration
      console.log('Registering user:', userData)
      
      // Simulate API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      // Placeholder response
      const mockResponse = {
        user: {
          id: Date.now(),
          name: userData.name,
          email: userData.email,
          role: userData.role || 'customer',
        },
        token: 'mock-jwt-token',
        role: userData.role || 'customer',
      }

      setAuthState({
        user: mockResponse.user,
        token: mockResponse.token,
        role: mockResponse.role,
      })

      // Store in localStorage
      localStorage.setItem('authToken', mockResponse.token)
      localStorage.setItem('user', JSON.stringify(mockResponse.user))
      localStorage.setItem('userRole', mockResponse.role)

      return mockResponse
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      token: null,
      role: null,
    })

    // Clear localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
  }, [])

  const updateAuthState = useCallback((updates) => {
    setAuthState((prev) => ({ ...prev, ...updates }))
  }, [])

  // ========== Services Functions ==========
  const fetchServices = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))
      // Return current services from state
      return services
    } catch (error) {
      console.error('Fetch services error:', error)
      // Return current services on error
      return services
    }
  }, [services])

  const addService = useCallback(async (serviceData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      const newService = {
        ...serviceData,
        id: Date.now(),
        status: serviceData.status || 'Active',
      }
      setServices((prev) => [...prev, newService])
      return newService
    } catch (error) {
      console.error('Add service error:', error)
      throw error
    }
  }, [])

  const updateService = useCallback(async (serviceId, updates) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      let updatedService = null
      setServices((prev) =>
        prev.map((s) => {
          if (s.id === serviceId) {
            updatedService = { ...s, ...updates }
            return updatedService
          }
          return s
        })
      )
      if (!updatedService) {
        throw new Error(`Service with ID ${serviceId} not found.`)
      }
      return updatedService
    } catch (error) {
      console.error('Update service error:', error)
      throw error
    }
  }, [])

  const deleteService = useCallback(async (serviceId) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      setServices((prev) => prev.filter((s) => s.id !== serviceId))
    } catch (error) {
      console.error('Delete service error:', error)
      throw error
    }
  }, [])

  // ========== Vehicles Functions ==========
  const fetchVehicles = useCallback(async (userId) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))
      // Filter vehicles by userId if provided, otherwise return all
      if (userId) {
        return vehicles.filter(v => v.userId === userId)
      }
      return vehicles
    } catch (error) {
      console.error('Fetch vehicles error:', error)
      return vehicles
    }
  }, [vehicles])

  const addVehicle = useCallback(async (vehicleData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      const newVehicle = {
        ...vehicleData,
        id: Date.now(),
        userId: vehicleData.userId || authState.user?.id || null,
      }
      setVehicles((prev) => [...prev, newVehicle])
      return newVehicle
    } catch (error) {
      console.error('Add vehicle error:', error)
      throw error
    }
  }, [authState.user])

  const updateVehicle = useCallback(async (vehicleId, updates) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      let updatedVehicle = null
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === vehicleId) {
            updatedVehicle = { ...v, ...updates }
            return updatedVehicle
          }
          return v
        })
      )
      if (!updatedVehicle) {
        throw new Error(`Vehicle with ID ${vehicleId} not found.`)
      }
      return updatedVehicle
    } catch (error) {
      console.error('Update vehicle error:', error)
      throw error
    }
  }, [])

  const deleteVehicle = useCallback(async (vehicleId) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId))
    } catch (error) {
      console.error('Delete vehicle error:', error)
      throw error
    }
  }, [])

  // ========== Requests Functions ==========
  const fetchRequests = useCallback(async (filters = {}) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))
      // Filter requests based on filters
      let filteredRequests = requests
      if (filters.customerId) {
        filteredRequests = filteredRequests.filter(r => r.customerId === filters.customerId)
      }
      if (filters.mechanicId) {
        filteredRequests = filteredRequests.filter(r => r.mechanicId === filters.mechanicId)
      }
      if (filters.status) {
        filteredRequests = filteredRequests.filter(r => r.status === filters.status)
      }
      return filteredRequests
    } catch (error) {
      console.error('Fetch requests error:', error)
      return requests
    }
  }, [requests])

  const createRequest = useCallback(async (requestData) => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      // Create request with customerId from authState if not provided
      const newRequest = {
        ...requestData,
        id: `REQ-${Date.now()}`,
        customerId: requestData.customerId || authState.user?.id || null,
        createdAt: requestData.createdAt || new Date().toISOString(),
        status: requestData.status || 'Pending',
      }
      
      // Update local state
      setRequests((prev) => [...prev, newRequest])
      
      return newRequest
    } catch (error) {
      console.error('Create request error:', error)
      throw error
    }
  }, [authState.user])

  const updateRequest = useCallback(async (requestId, updates) => {
    try {
      // For now, update request locally
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      // Update local state and return updated request
      let updatedRequest = null
      setRequests((prev) => {
        const updated = prev.map((r) => {
          if (r.id === requestId || r.id === `REQ-${requestId}` || String(r.id) === String(requestId)) {
            updatedRequest = { ...r, ...updates }
            return updatedRequest
          }
          return r
        })
        return updated
      })
      
      return updatedRequest
      
      // In production, uncomment this:
      // const response = await fetch(`/api/requests/${requestId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${authState.token}`,
      //   },
      //   body: JSON.stringify(updates),
      // })
      // const updatedRequest = await response.json()
      // setRequests((prev) =>
      //   prev.map((r) => (r.id === requestId ? updatedRequest : r))
      // )
      // return updatedRequest
    } catch (error) {
      console.error('Update request error:', error)
      throw error
    }
  }, [])

  const deleteRequest = useCallback(async (requestId) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      setRequests((prev) => prev.filter((r) => r.id !== requestId))
    } catch (error) {
      console.error('Delete request error:', error)
      throw error
    }
  }, [])

  // ========== Notifications Functions ==========
  const fetchNotifications = useCallback(async (userId) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))
      // Filter notifications by userId if provided
      if (userId) {
        return notifications.filter(n => n.userId === userId || !n.userId)
      }
      return notifications
    } catch (error) {
      console.error('Fetch notifications error:', error)
      return notifications
    }
  }, [notifications])

  const addNotification = useCallback((notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
    }
    setNotifications((prev) => [newNotification, ...prev])
    return newNotification
  }, [])

  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error('Mark notification as read error:', error)
      // Update locally even if API fails
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error('Delete notification error:', error)
      throw error
    }
  }, [])

  // ========== Chat Messages Functions ==========
  const fetchChatMessages = useCallback(async (requestId) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))
      // Filter chat messages by requestId
      if (requestId) {
        return chatMessages.filter(
          (msg) => msg.requestId === requestId || msg.requestID === requestId
        )
      }
      return chatMessages
    } catch (error) {
      console.error('Fetch chat messages error:', error)
      return chatMessages
    }
  }, [chatMessages])

  const sendChatMessage = useCallback(async (requestId, message) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      const newMessage = {
        requestId,
        requestID: requestId, // Support both formats
        senderId: authState.user?.id || null,
        senderID: authState.user?.id || null, // Support both formats
        senderName: authState.user?.name || 'User',
        message: typeof message === 'string' ? message : message.message || '',
        timestamp: new Date().toISOString(),
        isMe: true,
      }
      setChatMessages((prev) => [...prev, newMessage])
      return newMessage
    } catch (error) {
      console.error('Send chat message error:', error)
      throw error
    }
  }, [authState.user])

  const addChatMessage = useCallback((message) => {
    const newMessage = {
      ...message,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    }
    setChatMessages((prev) => [...prev, newMessage])
    return newMessage
  }, [])

  // ========== Users Functions (Admin) ==========
  const fetchUsers = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))
      // Return current users from state
      return users
    } catch (error) {
      console.error('Fetch users error:', error)
      // Return current users on error
      return users
    }
  }, [users])

  const addUser = useCallback(async (userData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      const newUser = {
        ...userData,
        id: Date.now(),
        status: userData.status || 'Active',
      }
      setUsers((prev) => [...prev, newUser])
      return newUser
    } catch (error) {
      console.error('Add user error:', error)
      throw error
    }
  }, [])

  const updateUser = useCallback(async (userId, updates) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      let updatedUser = null
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            updatedUser = { ...u, ...updates }
            return updatedUser
          }
          return u
        })
      )
      if (!updatedUser) {
        throw new Error(`User with ID ${userId} not found.`)
      }
      return updatedUser
    } catch (error) {
      console.error('Update user error:', error)
      throw error
    }
  }, [])

  const deleteUser = useCallback(async (userId) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (error) {
      console.error('Delete user error:', error)
      throw error
    }
  }, [])

  // ========== Context Value ==========
  const value = {
    // States
    authState,
    services,
    vehicles,
    requests,
    notifications,
    chatMessages,
    users,

    // Auth Functions
    login,
    register,
    logout,
    updateAuthState,

    // Services Functions
    fetchServices,
    addService,
    updateService,
    deleteService,

    // Vehicles Functions
    fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,

    // Requests Functions
    fetchRequests,
    createRequest,
    updateRequest,
    deleteRequest,

    // Notifications Functions
    fetchNotifications,
    addNotification,
    markNotificationAsRead,
    deleteNotification,

    // Chat Messages Functions
    fetchChatMessages,
    sendChatMessage,
    addChatMessage,

    // Users Functions (Admin)
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default AppContext

