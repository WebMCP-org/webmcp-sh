---
title: "State Management in React: A Complete Guide"
description: "Explore different state management solutions in React, from local state to global state management with Redux, Zustand, and other modern alternatives."
image: "/blog/nextjs.webp"
date: "2024-03-15"
authorName: "Manu Arora"
authorSrc: "/avatars/manu.png"
---

# State Management in React: A Complete Guide

State management is a crucial aspect of React applications. Let's explore different approaches to managing state, from simple local state to complex global state management solutions.

## Local State Management

### 1. useState Hook

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### 2. useReducer Hook

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>Increment</button>
      <button onClick={() => dispatch({ type: "decrement" })}>Decrement</button>
    </div>
  );
}
```

## Context API

### 1. Basic Context Setup

```jsx
const ThemeContext = React.createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
```

### 2. Context with useReducer

```jsx
const initialState = {
  theme: "light",
  user: null,
  notifications: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    default:
      return state;
  }
}

const AppContext = React.createContext();

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
```

## Redux

### 1. Basic Redux Setup

```jsx
// store.js
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

// counterSlice.js
import { createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;
```

### 2. Redux with Async Actions

```jsx
// userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUser = createAsyncThunk("user/fetchUser", async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});
```

## Zustand

### 1. Basic Store

```jsx
import create from "zustand";

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

function Counter() {
  const { count, increment, decrement } = useStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
}
```

### 2. Complex Store with Middleware

```jsx
import create from "zustand";
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      theme: "light",
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
    }),
    {
      name: "app-storage",
      getStorage: () => localStorage,
    },
  ),
);
```

## Jotai

### 1. Atomic State Management

```jsx
import { atom, useAtom } from "jotai";

const countAtom = atom(0);
const doubleAtom = atom((get) => get(countAtom) * 2);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [doubled] = useAtom(doubleAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### 2. Async Atoms

```jsx
import { atom, useAtom } from "jotai";
import { atomWithQuery } from "jotai/query";

const userAtom = atomWithQuery((get) => ({
  queryKey: ["user", get(userIdAtom)],
  queryFn: async ({ queryKey: [, id] }) => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },
}));
```

## Best Practices

1. Choose the right state management solution based on your needs
2. Keep state as local as possible
3. Use context for theme, authentication, and other global settings
4. Consider using Redux for complex applications with many state updates
5. Use Zustand or Jotai for simpler applications
6. Implement proper error handling and loading states
7. Use TypeScript for better type safety
8. Implement proper testing for state management
9. Consider performance implications
10. Use devtools for debugging

## Conclusion

State management in React has evolved significantly over the years, offering various solutions for different use cases. Whether you're building a small application or a large-scale project, there's a state management solution that fits your needs. Remember to choose the right tool for your specific use case and follow best practices to maintain a clean and maintainable codebase.
