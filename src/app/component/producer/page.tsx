// "use client";

// import { useEffect, useReducer } from "react";
// import { useAuth } from "../authProvider"; 

// const initialState = {
//     count: 1,
//     name: "Le Van A"
// };

// function reducer(state: { count: number; }, action: { type: any; }) {
//     switch (action.type) {
//         case "increment":
//             return { ...state, count: state.count + 1 }; 
//         case "decrement":
//             return { ...state, count: state.count - 1 }; 
//         default:
//             return state; 
//     } 
// }

// function Counter() {
//     const auth = useAuth(); 
//     const [state, dispatch] = useReducer(reducer, initialState);

//     useEffect(() => {
//     }, [state.count, auth?.user]);

//     return (
//         <div>
//             <p>Count: {state.count}</p>
//             <button onClick={() => dispatch({ type: "increment" })}>Increment</button>
//             <button onClick={() => dispatch({ type: "decrement" })}>Decrement</button>
//             <p>User: {auth?.user ? JSON.stringify(auth.user.name) : "No user logged in"}</p>
//         </div>
//     );
// }

// export default Counter;


"use client";

import useSWR from "swr";
import { notFound } from "next/navigation";
import styles from "../../styles/detail_user.module.css"

const fetcher = (url: string) => fetch(url, 
    { headers: { Accept: "application/json" } })
    .then((res) => {
    if (!res.ok) throw new Error("User not found");
    return res.json();
});

export default function ViewUserDetail() {
  const { data: detailUser, error, isLoading } = useSWR(
    'http://localhost:3000/api/manage_account/user/3',
    fetcher
  );

  if (error) return notFound();

  if (isLoading) return <p className={styles.loading}>⏳ Đang tải dữ liệu...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.inf_user_container}>
        <h1 className={styles.title}>Thông tin người dùng {detailUser.id}!</h1>
        <div className={styles.inf_user}>
          <img className={styles.avt_user} src={detailUser.avatar} alt="Avatar" />
          <p>Họ tên: {detailUser.name}</p>
        </div>
      </div>
    </div>
  );
}
