// "use client";
// import { useState } from "react";

// export default function Home() {
//   const [theInput, setTheInput] = useState("");
//   const [messages, setMessages] = useState([
//     {
//       role: "assistant",
//       content: "Yo, this is ChatterBot! How can I help you today?",
//     },
//   ]);
//   const callGetResponse = async () => {
//     const temp = messages;
//     temp.push({ role: "user", content: theInput });
//     setMessages(temp);
//     setTheInput("");

//     const response = await fetch("/api/chat", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },

//       body: JSON.stringify({ messages }),
//     });

//     const data = await response.json();
//     const { output } = data;
//     console.log("OpenAI replied...", output.content);

//     setMessages((prevMessages) => [...prevMessages, output]);
//   };

//   const Submit = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (event.key === "Enter") {
//       event.preventDefault();
//       callGetResponse();
//     }
//   };

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between px-24 py-5">
//       <h1 className="text-5xl font-sans">ChatterBot</h1>

//       <div className="flex  h-[35rem] w-[40rem] flex-col items-center bg-gray-600 rounded-xl">
//         <div className=" h-full flex flex-col gap-2 overflow-y-auto py-8 px-3 w-full">
//           {messages.map((e) => {
//             return (
//               <div
//                 key={e.content}
//                 className={`w-max max-w-[18rem] rounded-md px-4 py-3 h-min ${
//                   e.role === "assistant"
//                     ? "self-start  bg-gray-200 text-gray-800"
//                     : "self-end  bg-gray-800 text-gray-50"
//                 } `}
//               >
//                 {e.content}
//               </div>
//             );
//           })}
//         </div>
//         <div className="relative  w-[80%] bottom-4 flex justify-center">
//           <textarea
//             value={theInput}
//             onChange={(event) => setTheInput(event.target.value)}
//             className="w-[85%] h-10 px-3 py-2
//           resize-none overflow-y-auto text-black bg-gray-300 rounded-l outline-none"
//             onKeyDown={Submit}
//           />
//           <button
//             onClick={callGetResponse}
//             className="w-[15%] bg-blue-500 px-4 py-2 rounded-r"
//           >
//             send
//           </button>
//         </div>
//       </div>

//       <div></div>
//     </main>
//   );
// }


// "use client";
// import { useState } from "react";

// export default function Home() {
//   const [theInput, setTheInput] = useState("");
//   const [messages, setMessages] = useState([
//     {
//       role: "assistant",
//       content: "Yo, this is ChatterBot! How can I help you today?",
//     },
//   ]);
//   const [imgUrl, setImgUrl] = useState("");
//   const callGetResponse = async () => {
//     const updatedMessages = [...messages, { role: "user", content: theInput }];
//     setMessages(updatedMessages);
//     setTheInput("");
  
//     const response = await fetch("/api/chat", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ messages: theInput }),
//     });
  
//     const data = await response.json();
//     console.log("OpenAI replied...", data.imageUrl);
//     setImgUrl(data.imageUrl);
//   };
  

//   const Submit = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (event.key === "Enter") {
//       event.preventDefault();
//       callGetResponse();
//     }
//   };

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between px-24 py-5">
//       <h1 className="text-5xl font-sans">ChatterBot</h1>

//       <div className="flex  h-[35rem] w-[40rem] flex-col items-center bg-gray-600 rounded-xl">
//         <div className=" h-full flex flex-col gap-2 overflow-y-auto py-8 px-3 w-full">
//           {messages.map((e) => {
//             return (
//               <div
//                 key={e.content}
//               >
//                 {e.content}
//               </div>
//             );
//           })}
//         </div>
//         {imgUrl && <img src={imgUrl} alt="Generated Image" width={100} height={100} />}
//         <div className="relative  w-[80%] bottom-4 flex justify-center">
//           <textarea
//             value={theInput}
//             onChange={(event) => setTheInput(event.target.value)}
//             className="w-[85%] h-10 px-3 py-2
//           resize-none overflow-y-auto text-black bg-gray-300 rounded-l outline-none"
//             onKeyDown={Submit}
//           />
//           <button
//             onClick={callGetResponse}
//             className="w-[15%] bg-blue-500 px-4 py-2 rounded-r"
//           >
//             send
//           </button>
//         </div>
//       </div>

//       <div>
//       </div>
//     </main>
//   );
// }


"use client";
import { useState } from "react";
import styles from "../../../styles/content_create.module.css";

export default function Home() {
  const [theInput, setTheInput] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Yo, this is ChatterBot! How can I help you today?",
    },
  ]);
  const callGetResponse = async () => {
    const temp = messages;
    temp.push({ role: "user", content: theInput });
    setMessages([...temp]);
    setTheInput("");

    const response = await fetch("/api/manage_account/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ messages}),
    });

    const data = await response.json();
    const output = data;
    console.log("OpenAI replied...", output.messages.content);

    setMessages((prevMessages) => [...prevMessages, output.messages]);
    setImgUrl(data.imageUrl);
  };

  const Submit = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      callGetResponse();
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <h1 className="text-5xl font-sans">ChatterBot</h1>

        <div className={styles.main_content}>
          <div className=" h-full flex flex-col gap-2 overflow-y-auto py-8 px-3 w-full">
            {messages.map((e) => {
              return (
                <div
                  key={e.content}
                  className={e.role === 'assistant' ? styles.assistant : styles.users}
                >
                  {e.content}
                </div>
              );
            })}
          </div>
          {imgUrl && <img className={styles.img} src={imgUrl} alt="Generated Image" width={100} height={100} />}
          <div className={styles.input_footer}>
            <textarea
              value={theInput}
              onChange={(event) => setTheInput(event.target.value)}
              className={styles.input_text}
              onKeyDown={Submit}
            />
            <button
              onClick={callGetResponse}
              className={styles.btn_send}
            >
              send
            </button>
          </div>
        </div>
      </div>
      <div></div>
    </main>
  );
}
