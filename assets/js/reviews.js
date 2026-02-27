
document.addEventListener("DOMContentLoaded",()=>{
let slides=document.querySelectorAll(".review-slide");
let i=0;
const show=()=>{slides.forEach(s=>s.classList.remove("is-active"));slides[i].classList.add("is-active");}
document.querySelector("[data-next]").onclick=()=>{i=(i+1)%slides.length;show();}
document.querySelector("[data-prev]").onclick=()=>{i=(i-1+slides.length)%slides.length;show();}
});
