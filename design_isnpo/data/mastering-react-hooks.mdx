---
title: "Mastering React Hooks"
description: "Learn how to effectively use React Hooks to manage state and side effects in your functional components. A comprehensive guide to useState, useEffect, and custom hooks."
image: "/blog/nextjs.webp"
date: "2024-01-15"
authorName: "Manu Arora"
authorSrc: "/avatars/manu.png"
---

# Mastering React Hooks

React Hooks have transformed how we write React components by allowing us to use state and other React features in functional components. Let's dive deep into the world of hooks and learn how to use them effectively.

## Understanding React Hooks

React Hooks are functions that let you "hook into" React state and lifecycle features from function components. They were introduced in React 16.8 to allow you to use state and other React features without writing a class.

## Core Hooks

### 1. useState

The useState hook is the most basic hook that lets you add state to functional components:

```jsx
const [count, setCount] = useState(0);
```

### 2. useEffect

useEffect lets you perform side effects in function components:

```jsx
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);
```

### 3. useContext

useContext provides a way to pass data through the component tree without having to pass props manually:

```jsx
const value = useContext(MyContext);
```

## Custom Hooks

Custom hooks allow you to extract component logic into reusable functions:

```jsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
```

## Best Practices

1. Only call hooks at the top level
2. Only call hooks from React function components
3. Use multiple useEffect hooks to separate concerns
4. Clean up side effects in useEffect
5. Use the dependency array correctly

## Common Use Cases

### Form Handling

```jsx
function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return [values, handleChange];
}
```

### Data Fetching

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}
```

## Conclusion

React Hooks have made it easier to write and maintain React applications. By understanding and implementing these patterns, you can create more maintainable and reusable code in your React applications.
