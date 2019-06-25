var materiaux = {};
var noeuds = {};
var listeIntersection = [];
var mire;
var monde = {}
monde.entites = {};
monde.materiaux = {};
monde.textures = {};
var spheres = [];
var game = [];
var offset_i = -14.5;
var offset_j = +7.5;
var visitor;
var target = null;
/*  */
var attendre = false;
var guide_state = 0;
var etat_guide = "idle";
var positionVisite = 0;
var sph1;
var mat_guide = creerLambert(0x00ff00);
var mat2 = creerLambert(0xffff00);

function guideEnerve(){

	guideUtilisateur.rotation.y = guideUtilisateur.rotation.y +2;
}


function positionConforme(){
	var xguide = guideUtilisateur.position.x;
	var zguide = guideUtilisateur.position.z;
	var xcam = getPosCamAxeX();
	var ycam =  getPosCamAxeY();
	var zcam = getPosCamAxeZ();

	if(ycam > 5){
		//console.log("La hauteur de la caméra est incorrect");
		return false;
	}
	if(etat_guide == "EtatSortieEnCours" || etat_guide == "Utilisater_loin_sortie"){
		if(xcam < xguide ){
			//console.log("L'utilisateur est en avance par rapport au guilde xcam < xguide "+(xcam - xguide)+" "+etat_guide);
			return false;
		}
	}else{
		if(xcam > xguide ){
			//console.log("L'utilisateur est en avance par rapport au guilde xcam > xguide "+etat_guide);
			return false;
		}
	}

	if(Math.abs(xcam - xguide)>= 7){
		//console.log("l'utilisateur est loin de la portée du guide selon l'axe x"+Math.abs(xcam - xguide));
		guideEnerve();
		return false;
	}
	if(Math.abs(zcam-zguide)>=7){
		//console.log("l'utilisateur est loin de la portée du guide selon l'axe z");
		guideEnerve();
		return false;
	}
	//console.log("l'utilisateur est dans la portée du guide")
	return true;
}

function choisirguideUtilisateurEtat(){
	var date = new Date();
	var timeKnow = date.getTime();
	if(attendre == true && ( timeKnow-timer)> 6000){
		//console.log("Temps d'attente fini");
		attendre=false;
		return;
	}else if(attendre == true){
		//console.log("clock :"+timeKnow);
		//console.log("Consultation tableau "+( timeKnow-timer));
		return;
	}

	if(positionConforme()==false && positionVisite != 5 && etat_guide != "Sortie"){
		if(etat_guide == "EtatSortieEnCours" || etat_guide == "Utilisater_loin_sortie"){
			etat_guide = "Utilisater_loin_sortie"
		}else{
			etat_guide = "Utilisater_loin";
		}
		return;
	}

	if(positionVisite==0){
		etat_guide = "EnMarche"
		guideUtilisateur.rotation.y = 0;
		if(guideUtilisateur.position.z>15.9){
			positionVisite = 1;
		}
		guideUtilisateur.position.z = guideUtilisateur.position.z + 0.2;
	}else if(positionVisite == 1){
		guideUtilisateur.rotation.y = 45;
		if(guideUtilisateur.position.x >15){
			guideUtilisateur.rotation.y = 45;
			etat_guide = "VisualisationTableau1";
			timer =  timeKnow;
			//console.log("timer :"+timer);
			attendre = true;
			positionVisite = 2;
		}
		guideUtilisateur.position.x = guideUtilisateur.position.x + 0.2;
	}else if(positionVisite == 2){
		guideUtilisateur.rotation.y = 0;
		if(guideUtilisateur.position.z >14){
			guideUtilisateur.rotation.y = 45;
			etat_guide = "VisualisationTableau2";
			timer =  timeKnow;
			attendre = true;
			positionVisite = 3;
		}
		guideUtilisateur.position.z = guideUtilisateur.position.z + 0.2;
	}else if (positionVisite == 3){
		guideUtilisateur.rotation.y = 135;
		if(guideUtilisateur.position.z <13){
			etat_guide = "VisualisationTableau3";
			timer =  timeKnow;
			attendre = true;
			positionVisite = 4;
		}
		guideUtilisateur.position.z = guideUtilisateur.position.z - 0.2;
	}else if(positionVisite == 4){
		etat_guide ="EtatSortieEnCours";
		guideUtilisateur.rotation.y = -45;
		if(guideUtilisateur.position.x < -13 ){
			etat_guide = "Sortie";
			positionVisite = 5;
		}
		guideUtilisateur.position.x = guideUtilisateur.position.x - 0.2;
	}
	//console.log("etat guide : "+etat_guide)
}

function guide() {
	guideUtilisateur = chargerObj("guide", "assets/pingouin/", "assets/pingouin/", "assets/pingouin/",
		"penguin.obj", "penguin.mtl");
	placerXYZ(guideUtilisateur, 20, 0, 0);
	parentDe(scene, guideUtilisateur);
	console.log("Fin de création de la scène");

}


var KeyboardControls = function(object){
	this.object    = object ; 

	this.position  = new THREE.Vector3(1,1.7,5) ; 

	this.angle     = 0.0 ; 
	this.direction = new THREE.Vector3(1,0,0) ; 
	this.cible     = new THREE.Vector3(2,1.7,5) ; 

	this.vitesse   = 20.0 ;

	this.plusHaut  = false ; 
	this.plusBas   = false ; 
	this.enAvant   = false ; 
	this.enArriere = false ; 
	this.aGauche   = false ; 
	this.aDroite   = false ; 
}

KeyboardControls.prototype.update = function(dt){


	if(this.plusHaut)
		this.position.y += this.vitesse * dt ; 

	if(this.plusBas)
		this.position.y -= this.vitesse * dt ; 

	if(this.aGauche)
		this.angle += 0.05 ; 


	if(this.aDroite)
		this.angle -= 0.05 ; 

	if(this.enAvant){
		this.position.x +=  this.vitesse * dt * Math.cos(this.angle) ; 
		this.position.z += -this.vitesse * dt * Math.sin(this.angle) ;  
	}

	if(this.enArriere){
		this.position.x -=  this.vitesse * dt * Math.cos(this.angle) ; 
		this.position.z -= -this.vitesse * dt * Math.sin(this.angle) ;  
	}
	
	this.object.position.copy(this.position) ; 

	this.direction.set(Math.cos(this.angle),0.0,-Math.sin(this.angle)) ; 
	

	if(mouseClicked) {
		this.object.position.set(ext.x,ext.y,ext.z);
		this.position.set(ext.x,ext.y,ext.z);
		this.cible.set(origin.x,origin.y,origin.z);
		this.direction.set(origin.x-ext.x,origin.y-ext.y,origin.z-ext.z) ; 
		this.angle = -Math.atan2(this.direction.z,this.direction.x);

		mouseClicked = false ; 

	} else {
		this.cible.set(this.position.x + Math.cos(this.angle), 
						this.position.y, 
						this.position.z - Math.sin(this.angle))	
		 
	} ;

	this.object.lookAt(this.cible) ; 

	
}












function keyUp(event){
	switch(event.keyCode){
		case 33 : // HAUT
			controls.plusHaut = false ; 
			break ; 
		case 34 : // BAS
			controls.plusBas = false ;
			break ; 
		case 37 : // GAUCHE
			controls.aGauche = false ; 
			break ; 
		case 38 : // HAUT
			controls.enAvant = false ;
			break ; 
		case 39 : // DROITE
			controls.aDroite = false ;
			break ; 
		case 40 : // BAS
			controls.enArriere = false ;
			break ; 
	}
}



function keyDown(event){
	//mouseClicked=false;
	console.log("KEYDOWN") ; 
	switch(event.keyCode){
		case 33 : // HAUT
			controls.plusHaut = true ; 
			break ; 
		case 34 : // BAS
			controls.plusBas = true ;
			break ; 
		case 37 : // GAUCHE
			controls.aGauche = true ; 
			break ; 
		case 38 : // HAUT
			controls.enAvant = true ;
			break ; 
		case 39 : // DROITE
			controls.aDroite = true ;
			break ; 
		case 40 : // BAS
			controls.enArriere = true ;
			break ; 
	}
}

var mouse     = new THREE.Vector2() ; 
var raycaster = new THREE.Raycaster() ; 
var mouseClicked = false ; 
var world = null ; 
var origin = new THREE.Vector3() ; 
var ext = new THREE.Vector3() ; 





function mouseMove(event){
}

function mouseDown(event){
	event.preventDefault() ; 
	mouse.x = (event.clientX/window.innerWidth)*2-1 ; 
	mouse.y = (-event.clientY/window.innerHeight)*2+1 ; 
	raycaster.setFromCamera(mouse,camera) ; 
	var intersects = raycaster.intersectObjects(scene.children,true) ;
	if(intersects.length>0){
		pointeur.position.set(intersects[0].point.x,intersects[0].point.y,+intersects[0].point.z) ; 
		mouseClicked = true ; 
		world  = intersects[0].object.matrixWorld;
		origin = new THREE.Vector3(0,0,0) ; 
		ext    = new THREE.Vector3(0,0,2) ; 
		origin.applyMatrix4(world) ; 
		ext.applyMatrix4(world) ; 
		
	}
}

