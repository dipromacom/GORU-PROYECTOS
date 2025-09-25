/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import TodoListForm from "./TodoListForm";
import TodoItem from "./TodoItem";
import './TodoList.css'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const TodoList = ({ toDo = [], persona, usuario, setToDos, enableCheck = true, addTaskCallback, markAsDoneCallback, interesado }) => {
    const [labels, setLabels] = useState([])

    const markAsDone = (id, closeDate) => {
        if (typeof markAsDoneCallback === 'function') {
            markAsDoneCallback(id, closeDate);
        } else if (typeof setToDos === 'function') {
            setToDos(prev => (prev || []).map(todo => {
                if (!todo) return todo;
                if (todo.id === id) {
                    return { ...todo, done: true, closeDate };
                }
                return todo;
            }));
        }
    }

    const deleteItemHandler = (id) => {
        if (typeof setToDos === 'function') {
            setToDos(prev => (prev || []).filter((item) => item?.id !== id));
        }
    };

    return (
        <div className="todo-list mb-5">
            <TodoListForm
                setToDos={setToDos}
                persona={persona}
                labels={labels}
                setLabels={setLabels}
                addTaskCallback={addTaskCallback}
                interesado={interesado}
            />

            {toDo && toDo.length > 0 ? (
                <div className="mt-3">
                    <h2>Tareas</h2>
                    <ul className="pl-0" style={{ listStyleType: 'none' }}>
                        {toDo.map((item) => (
                            <li key={item.id}>
                                {/* quitamos la clase dismissed desde aquí */}
                                <TodoItem
                                    enableCheck={enableCheck}
                                    {...item}
                                    onComplete={(id, closeDate) => markAsDone(id, closeDate)}
                                    onDelete={id => deleteItemHandler(id)}
                                    forceVisible // 🔹 nueva prop para evitar estilos raros
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="pt-3 text-center">
                    <h2 className="mb-2">
                        <DotLottieReact
                            loop
                            autoplay
                            style={{ width: "300px", height: "300px", margin: "auto" }}
                            src="https://lottie.host/27602164-6ebf-41b6-b99a-fe19dd171d77/qcF7qMxLIS.json"
                        />
                        <br />
                        No hay tareas
                    </h2>
                </div>
            )}
        </div>
    )
}

export default TodoList
