let coin = localStorage.getItem("coin") || 0;
document.getElementById("coins").innerText = "Coins: " + coin;

function selectCar(i){
  localStorage.setItem("car", i);
}

function startGame(){
  window.location.href = "game.html";
}
