import React, { useEffect, useState } from "react";
import { VoyageProvider, Wallet, getLogicDriver } from 'js-moi-sdk';
import { info, success } from "./utils/toastWrapper";
import { Toaster } from "react-hot-toast";
import Loader from "./components/Loader";

// ------- Update with your credentials ------------------ //
const logicId = "0x0800009b2ddec5632e63c752143c5208505cd8d42794f96678f10e54bdd3e16e860605"
const mnemonic = "heavy recall ketchup wisdom order shock final above kitten target spare squirrel"

const logicDriver = await gettingLogicDriver(
  logicId,
  mnemonic,
  "m/44'/6174'/7020'/0/0"
)

async function gettingLogicDriver(logicId, mnemonic, accountPath) {
  const provider = new VoyageProvider("babylon")
  const wallet = new Wallet(provider)
  await wallet.fromMnemonic(mnemonic, accountPath)
  return await getLogicDriver(logicId, wallet)
}

function App() {
  const [todoName, setTodoName] = useState("");
  const [todos, setTodos] = useState([]);

  // Loaders
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    getTodos();
  }, []);

  const handleTodoName = (e) => {
    setTodoName(e.currentTarget.value);
  };

  const getTodos = async () => {
    try {
      const tTodos = await logicDriver.persistentState.get("todos")
      setTodos(tTodos)
      setLoading(false);
    } catch (error) {
      setLoading(false)
      console.log(error);
    }
  };

  const add = async (e) => {
    e.preventDefault();
    try {
      setAdding(true)
      info("Adding Todo ...");
      
      const ix = await logicDriver.routines.Add([todoName]).send({
        fuelPrice: 1,
        fuelLimit: 1000,
      });

      // Waiting for tesseract to be mined
      await ix.wait()
      
      await getTodos()
      success("Successfully Added");
      setTodoName("")
      setAdding(false)
    } catch (error) {
      console.log(error);
    }
  };

  const markCompleted = async (id) => {
    try {
      setMarking(id)
      const ix = await logicDriver.routines.MarkTodoCompleted([id]).send({
        fuelPrice: 1,
        fuelLimit: 1000,
      });
      // Waiting for tesseract to be mined
      await ix.wait();
      
      const tTodos = [...todos];
      tTodos[id].completed = true;
      setTodos(tTodos);
      setMarking(false)
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Toaster />
      <section class="section-center">
        <form class="todo-form">
          <p class="alert"></p>
          <h3>Divyanshu's Todo ~Moi~</h3>
          <div class="form-control">
            <input
              value={todoName}
              name="todoName"
              onChange={handleTodoName}
              type="text"
              id="todo"
              placeholder="e.g. Divyanshu is here dude"
            />
            <button onClick={add} type="submit" class="submit-btn">
            {adding ? <Loader color={"#000"} loading={adding} /> :"Add Todo"}
            </button>
          </div>
        </form>
        {!loading ? (
          <div className="todo-container show-container">
            {/* Table for uncompleted tasks */}
            <div className="task-box">
              <h2>Incompleted Tasks</h2>
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todos
                    .filter((todo) => !todo.completed)
                    .map((todo, index) => (
                      <tr key={index}>
                        <td>{todo.name}</td>
                        <td>
                          {marking === index ? (
                            <Loader color={"#000"} loading={marking === 0 ? true : marking} />
                          ) : (
                            <span
                              onClick={() => markCompleted(index)}
                              className="underline text-red pointer"
                            >
                              Mark As Done Dude
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Table for completed tasks */}
            <div className="task-box">
              <h2>Completed Tasks</h2>
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Task</th>
                  </tr>
                </thead>
                <tbody>
                  {todos
                    .filter((todo) => todo.completed)
                    .map((todo, index) => (
                      <tr key={index}>
                        <td>{todo.name}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: "20px" }}>
            <Loader color={"#000"} loading={loading} />
          </div>
        )}
      </section>
    </>
  );
}

export default App;
