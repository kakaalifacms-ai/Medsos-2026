// 1. Impor module yang diperlukan dari firebase dan firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp, 
    doc, 
    updateDoc, 
    increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"


const firebaseConfig = {
    apiKey: "AIzaSyC_1XwbW-9zcNkRJXIQr4N1GgAyzQr6O2g",
    authDomain: "uasgenap2026-549f7.firebaseapp.com",
    projectId: "uasgenap2026-549f7",
    storageBucket: "uasgenap2026-549f7.firebasestorage.app",
    messagingSenderId: "560108074909",
    appId: "1:560108074909:web:50c7719780334c88bee174",
    measurementId: "G-E2WG6980GN"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const medsosCollection = collection(db, "medsos")

//(digunakan di halaman admin)
async function postingStatus(){
    
    let teks = document.getElementById("isiStatus").value
    
    if (teks === "") return
    
    try {
        await addDoc(medsosCollection, {
            konten: teks, 
            Likes: 0,
            Waktu: serverTimestamp()
        }) ;
        
        document.getElementById("isiStatus").value =""
        
        alert("Status berhasil ditambahkan! ")
    } catch (error) {
      alert("Gagal menambah status, silakan cobab lagi")
    }
}
    //4. 
    async function muatTimeline() {
        //periska
        if(!document.getElementById("timeline")) return
        
        //query
        const q = query(medsosCollection, orderBy("Waktu","desc")) 
    
    //onSnapshot
    onSnapshot(q, (snapshot)=> {
        //buat varibel
        let output = ""
        
        //loop
        snapshot.forEach((doc) => {
            //ambil data
            const data = doc.data()
            
            //ambil id dokumen
            const id = doc.id
            
            //buat html
            output +=`
            <div class="post-card">
             <div class="container">
             ${data.konten}
             </div>
            </div>
            `
        }) ;
        //tampilan HTML output di elemen dengan id"timeline"
        document.getElementById("timeline").innerHTML = output
    }) ;
}
// daftar fungsi
window.postingStatus = postingStatus

//pangggilan multiple
muatTimeline()

