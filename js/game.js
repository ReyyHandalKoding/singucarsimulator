let cars = [
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ToyCar/glTF-Binary/ToyCar.glb",
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb"
];

let selectedCar = localStorage.getItem("car") || 0;
let coin = parseInt(localStorage.getItem("coin")) || 0;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.1,1000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth,innerHeight);
document.body.appendChild(renderer.domElement);

let light = new THREE.HemisphereLight(0xffffff,0x444444);
scene.add(light);

camera.position.set(0,2,5);

let car;
new THREE.GLTFLoader().load(cars[selectedCar], g=>{
  car = g.scene;
  scene.add(car);
});

// ground
let tex = new THREE.TextureLoader().load("https://threejs.org/examples/textures/terrain/grasslight-big.jpg");
tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
tex.repeat.set(50,50);

let ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500,500),
  new THREE.MeshBasicMaterial({map:tex})
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// obstacle
let obstacles=[];
for(let i=0;i<15;i++){
  let o = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({color:0xff0000})
  );
  o.position.set((Math.random()-0.5)*50,0.5,(Math.random()-0.5)*50);
  scene.add(o);
  obstacles.push(o);
}

// finish
let finish = new THREE.Mesh(
  new THREE.PlaneGeometry(10,5),
  new THREE.MeshBasicMaterial({color:0xffff00})
);
finish.rotation.x = -Math.PI/2;
finish.position.set(0,0.01,-50);
scene.add(finish);

// control
let speed=0, turn=0;
let keys={};

document.addEventListener("keydown",e=>keys[e.key]=true);
document.addEventListener("keyup",e=>keys[e.key]=false);

// joystick
let dragging=false;
let joystick=document.getElementById("joystick");

joystick.addEventListener("touchstart",()=>dragging=true);
window.addEventListener("touchend",()=>dragging=false);

window.addEventListener("touchmove",e=>{
  if(!dragging)return;
  let rect=joystick.getBoundingClientRect();
  let x=e.touches[0].clientX-rect.left-40;
  let y=e.touches[0].clientY-rect.top-40;
  turn=x*0.002;
  speed=-y*0.002;
});

// nitro
let nitro=false;
document.getElementById("nitro").addEventListener("touchstart",()=>nitro=true);
document.getElementById("nitro").addEventListener("touchend",()=>nitro=false);

// sound
let audio = new Audio("https://www.soundjay.com/mechanical/sounds/car-engine-1.mp3");
audio.loop = true;
audio.play();

function animate(){
  requestAnimationFrame(animate);

  if(car){
    if(keys["w"]) speed=0.1;
    else if(keys["s"]) speed=-0.05;
    else speed*=0.95;

    if(keys["a"]) turn=0.03;
    else if(keys["d"]) turn=-0.03;
    else turn*=0.8;

    let sp = nitro ? 0.2 : speed;

    car.rotation.y+=turn;
    car.position.x+=Math.sin(car.rotation.y)*sp;
    car.position.z+=Math.cos(car.rotation.y)*sp;

    camera.position.x=car.position.x+Math.sin(car.rotation.y)*5;
    camera.position.z=car.position.z+Math.cos(car.rotation.y)*5;
    camera.lookAt(car.position);

    // collision
    obstacles.forEach(o=>{
      let dx=car.position.x-o.position.x;
      let dz=car.position.z-o.position.z;
      if(Math.sqrt(dx*dx+dz*dz)<1.5){
        speed=-0.05;
      }
    });

    // coin
    if(speed>0.05){
      coin++;
      localStorage.setItem("coin",coin);
    }

    // finish → WA DELAY
    let dx=car.position.x-finish.position.x;
    let dz=car.position.z-finish.position.z;

    if(Math.sqrt(dx*dx+dz*dz)<3){
      setTimeout(()=>{
        window.location.href = "https://chat.whatsapp.com/FkaAIFKS9ypK62izhdL6EO?mode=gi_t";
      },2000);
    }

    document.getElementById("ui").innerText = "Coins: "+coin;
  }

  renderer.render(scene,camera);
}

animate();
