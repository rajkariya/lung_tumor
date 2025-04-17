import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, update, remove, onValue, push, get,equalTo, orderByChild,query} from "firebase/database";
import { getStorage, ref as storageRef } from "firebase/storage";
const firebaseConfig = {
    apiKey: "AIzaSyBoaTcoAGPoHY_duC9AaZjCiyPk4E8glHY",
    authDomain: "ibm-project-25e26.firebaseapp.com",
    projectId: "ibm-project-25e26",
    storageBucket: "gs://ibm-project-25e26.firebasestorage.app",
    messagingSenderId: "807054638688",
    appId: "1:807054638688:web:7195d7a9e0f4163d1d4d05",
    databaseURL:"https://ibm-project-25e26-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);
const storage=getStorage(app);
export { database, ref, set, update, remove, onValue, push, get ,equalTo,orderByChild,query,storage};
