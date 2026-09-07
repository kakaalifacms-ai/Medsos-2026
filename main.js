// 1. Impor module yang diperlukan dari Firebase dan Firestore
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
    increment,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"


// 2. Config Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC_1XwbW-9zcNkRJXIQr4N1GgAyzQr6O2g",
    authDomain: "uasgenap2026-549f7.firebaseapp.com",
    projectId: "uasgenap2026-549f7",
    storageBucket: "uasgenap2026-549f7.firebasestorage.app",
    messagingSenderId: "560108074909",
    appId: "1:560108074909:web:50c7719780334c88bee174",
    measurementId: "G-E2WG6980GN"
};


// 3. Inisialisasi Firebase dan Firestore
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const medsosCollection = collection(db, "medsos")


// =========================
// FUNGSI TOAST
// =========================
function tampilToast(pesan) {

    const toast = document.getElementById("toast")

    if (!toast) return

    toast.innerText = pesan

    toast.classList.add("show")

    setTimeout(() => {
        toast.classList.remove("show")
    }, 2500)
}


// =========================
// 4. MEMBUAT POSTINGAN
// =========================
async function postingStatus() {

    const input = document.getElementById("isiStatus")

    if (!input) return

    let teks = input.value.trim()


    // Cek postingan kosong
    if (teks === "") {

        tampilToast(
            "⚠️ Postingan tidak boleh kosong!"
        )

        return
    }


    try {

        await addDoc(medsosCollection, {

            konten: teks,

            likes: 0,

            waktu: serverTimestamp()

        })


        // Kosongkan textarea
        input.value = ""


        // Notifikasi berhasil
        tampilToast(
            "🚀 Berhasil upload status!"
        )


    } catch (error) {

        console.error(error)

        tampilToast(
            "❌ Gagal menambahkan status."
        )

    }
}


// =========================
// 5. TIMELINE
// =========================
function muatTimeline() {

    const timeline =
        document.getElementById("timeline")


    if (!timeline) return


    const q = query(
        medsosCollection,
        orderBy("waktu", "desc")
    )


    // Menyimpan status yang sudah di-like
    const daftarLike =
        JSON.parse(
            localStorage.getItem("SUDAH_LIKE")
        ) || []


    // Suara postingan baru
    const suaraPostinganBaru =
        new Audio("notifikasi.mp3")


    let jumlahPostinganSebelumnya = null


    onSnapshot(q, (snapshot) => {


        // =========================
        // SUARA POSTINGAN BARU
        // =========================
        if (
            jumlahPostinganSebelumnya !== null &&
            snapshot.size > jumlahPostinganSebelumnya
        ) {

            suaraPostinganBaru.currentTime = 0

            suaraPostinganBaru.play()
                .catch((error) => {

                    console.log(
                        "Suara gagal:",
                        error
                    )

                })
        }


        jumlahPostinganSebelumnya =
            snapshot.size


        let output = ""


        // =========================
        // TAMPILKAN POSTINGAN
        // =========================
        snapshot.forEach((docSnapshot) => {

            const data =
                docSnapshot.data()

            const id =
                docSnapshot.id


            const sudahLike =
                daftarLike.includes(id)
                    ? "liked"
                    : ""


            output += `
                <div class="post-card">

                    <div class="post-content">
                        ${data.konten}
                    </div>

                    <button
                        id="btn-like-${id}"
                        class="btn-like ${sudahLike}"
                        onclick="sukaStatus('${id}')"
                    >
                        ❤️ ${data.likes || 0} Likes
                    </button>

                </div>
            `
        })


        timeline.innerHTML = output

    })
}


// =========================
// 6. LIKE
// =========================
async function sukaStatus(idDokumen) {

    let daftarLike =
        JSON.parse(
            localStorage.getItem("SUDAH_LIKE")
        ) || []


    // Cek apakah sudah Like
    if (daftarLike.includes(idDokumen)) {

        tampilToast(
            "⚠️ Kamu sudah menyukai status ini!"
        )

        return
    }


    try {

        // Tambahkan Like di Firestore
        await updateDoc(
            doc(
                db,
                "medsos",
                idDokumen
            ),
            {
                likes: increment(1)
            }
        )


        // Simpan ID postingan
        daftarLike.push(idDokumen)


        localStorage.setItem(
            "SUDAH_LIKE",
            JSON.stringify(daftarLike)
        )


        // Ubah tampilan tombol
        const tombol =
            document.getElementById(
                `btn-like-${idDokumen}`
            )


        if (tombol) {

            tombol.classList.add("liked")

        }


        // Suara Like
        bunyiLike()


        // Toast
        tampilToast(
            "❤️ Terima kasih sudah memberi Like!"
        )


    } catch (error) {

        console.error(error)

        tampilToast(
            "❌ Gagal memberikan Like."
        )

    }
}


// =========================
// 7. SUARA LIKE
// =========================
function bunyiLike() {

    const audio =
        new AudioContext()


    const oscillator =
        audio.createOscillator()


    const gain =
        audio.createGain()


    oscillator.frequency.value = 800


    oscillator.connect(gain)

    gain.connect(
        audio.destination
    )


    oscillator.start()


    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audio.currentTime + 0.2
    )


    oscillator.stop(
        audio.currentTime + 0.2
    )
}


// =========================
// 8. DAFTAR POSTINGAN ADMIN
// =========================
function muatDaftarAdmin() {

    const tempat =
        document.getElementById(
            "daftarAdmin"
        )


    if (!tempat) return


    const q = query(
        medsosCollection,
        orderBy("waktu", "desc")
    )


    onSnapshot(q, (snapshot) => {

        let output = ""


        // Tidak ada postingan
        if (snapshot.empty) {

            output =
                "<p>Belum ada postingan.</p>"

        } else {


            // Tampilkan semua postingan
            snapshot.forEach(
                (docSnapshot) => {

                    const data =
                        docSnapshot.data()


                    const id =
                        docSnapshot.id


                    output += `
                        <div class="post-card">

                            <div
                                class="post-content"
                                id="konten-${id}"
                            >
                                ${data.konten}
                            </div>


                            <button
                                class="btn-edit"
                                onclick="editPostingan('${id}')"
                            >
                                ✏️ Edit
                            </button>


                            <button
                                class="btn-delete"
                                onclick="hapusStatus('${id}')"
                            >
                                🗑️ Hapus Post
                            </button>

                        </div>
                    `
                }
            )
        }


        tempat.innerHTML = output

    })
}


// =========================
// 9. EDIT POSTINGAN
// =========================
async function editPostingan(idDokumen) {

    const elemen =
        document.getElementById(
            `konten-${idDokumen}`
        )


    if (!elemen) return


    const isiLama =
        elemen.innerText


    const isiBaru =
        prompt(
            "✏️ Edit postingan:",
            isiLama
        )


    // Jika Cancel
    if (isiBaru === null) {

        return

    }


    // Jika kosong
    if (isiBaru.trim() === "") {

        tampilToast(
            "⚠️ Postingan tidak boleh kosong!"
        )

        return
    }


    try {

        await updateDoc(
            doc(
                db,
                "medsos",
                idDokumen
            ),
            {
                konten: isiBaru.trim()
            }
        )


        tampilToast(
            "✅ Postingan berhasil diedit!"
        )


    } catch (error) {

        console.error(error)

        tampilToast(
            "❌ Gagal mengedit postingan."
        )

    }
}


// =========================
// 10. HAPUS POSTINGAN
// =========================
async function hapusStatus(idDokumen) {

    const yakin =
        confirm(
            "Apakah Anda yakin ingin menghapus postingan ini?"
        )


    if (!yakin) {

        return

    }


    try {

        // Hapus dari Firestore
        await deleteDoc(
            doc(
                db,
                "medsos",
                idDokumen
            )
        )


        tampilToast(
            "🗑️ Postingan berhasil dihapus!"
        )


    } catch (error) {

        console.error(error)

        tampilToast(
            "❌ Gagal menghapus postingan."
        )

    }
}


// =========================
// 11. DAFTARKAN FUNGSI KE HTML
// =========================
window.postingStatus =
    postingStatus

window.sukaStatus =
    sukaStatus

window.hapusStatus =
    hapusStatus

window.editPostingan =
    editPostingan


// =========================
// 12. JALANKAN PROGRAM
// =========================
muatTimeline()

muatDaftarAdmin()