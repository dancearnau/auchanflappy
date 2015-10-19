window.addEventListener("load", function() {

var availableTopAssets = [
  { img: "obstacles/banner-blugi.png" },
  { img: "obstacles/banner-branza.png" },
  { img: "obstacles/banner-ceai.png" },
  { img: "obstacles/banner-detergent.png" },
  { img: "obstacles/banner-par.png" },
  { img: "obstacles/banner-pilote.png" },
  { img: "obstacles/banner-sare.png" },
  { img: "obstacles/banner-spaghete.png" },
  { img: "obstacles/banner-tehnologie.png" },
  { img: "obstacles/banner-ulei.png" },
  { img: "obstacles/banner-vin.png" }
];
    
var availableBottomAssets = [
  { img: "obstacles/raft-auchan-blugi.png" },
  { img: "obstacles/raft-auchan-branza.png" },
  { img: "obstacles/raft-auchan-ceai.png" },
  { img: "obstacles/raft-auchan-detergent.png" },
  { img: "obstacles/raft-auchan-par.png" },
  { img: "obstacles/raft-auchan-pilote.png" },
  { img: "obstacles/raft-auchan-sare.png" },
  { img: "obstacles/raft-auchan-spaghete.png" },
  { img: "obstacles/raft-auchan-tehnologie.png" },
  { img: "obstacles/raft-auchan-ulei.png" },
  { img: "obstacles/raft-auchan-vin.png" }
];
    
var availableAssetsAsList = "";
(function () {
  var i;
  for (i = 0; i < availableTopAssets.length; i++) {
    availableAssetsAsList += availableTopAssets[i].img + ", ";
  }
  for (i = 0; i < availableTopAssets.length; i++) {
    availableAssetsAsList += availableBottomAssets[i].img + ", ";
  }
})();

var screenWidth = 800;
var screenHeight = 600;
var currentScore = 0;

var Q = window.Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
        .setup("game", {width: screenWidth, height: screenHeight, maximize: false})
        .controls().touch();

// For enabling debug mode (collision view)    
// Q.debug = true;
// Q.debugFill = true;
        
Q.input.touchControls({
  controls:  [ [],
               [],
               [],
               [],
               ['fire', 'Salt' ]]
});
        
function handlePlayerDying(player, shelf) {
  player.p.alive = false;
  player.p.opacity = 0.5;
  player.p.vx = 0;
  player.p.collisionMask = Q.SPRITE_NONE;
  player.p.angle = 30;
  
  currentScore = player.p.score;
  
  var shelfPair = shelf.p.shelfPair;
  
  shelfPair.top.p.opacity = 0.5;
  shelfPair.bottom.p.opacity = 0.5;
}

    function startGame() {
        currentScore = 0;
        Q.stageScene("level1");
        Q.stageScene("hud", 3, Q('Player').first().p);
    }

    function startStandings() {
        Q.stageScene("standings");
    }

    function facebookLogin() {
        //startGame();
        //return ;
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                    startGame();
            }  else {
                FB.login(function(){
                    startGame();
                }, {
                    scope: 'email'
                });
            }
        });
    }
    function getUserData() {
        FB.api('/me',{fields: 'name,email'}, function(response) {
            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", "/db/index.php?cmd=post&name=" + encodeURIComponent(response.name) + "&email=" + encodeURIComponent(response.email) + "&score=" + currentScore + "&facebookId=" + response.id, true);
            xhttp.send();
        });
    }

var SPRITE_BOX = 1;

Q.gravityY = 1200;

Q.Sprite.extend("StaticBird", {
  init: function(p) {

    this._super(p,{
      sheet: "bird",
      sprite: "bird",
      collisionMask: 0, 
      x: p && p.x || (screenWidth * 0.5),
      y: p && p.y || (screenHeight * 0.5)
    });
    
    this.add("animation");
  },
  
  step: function(dt) {
    this.play("walk_right");
  }
});

Q.Sprite.extend("Player",{

  init: function(p) {

    this._super(p,{
      sheet: "bird",
      sprite: "bird",
      collisionMask: SPRITE_BOX, 
      x: 40,
      y: screenHeight * 0.5,
      speed: 300,
      jump: -400,
      jumpCooldown: 0.15,
      jumpCooldownInterval: 0.15,
      collisionPolyPoints: null,
      score: 0,
      alive: true,
      buried: false,
      jumping: false,
      landed: false
    });

    this.add("2d, animation");
  },

  step: function(dt) {
    if (!this.collisionPolyPoints) {
      this.p.points = this.p.collisionPolyPoints = [[-this.p.cx, -10], [0, -this.p.cy], [this.p.cx, -this.p.cy], [20, 10], [0, this.p.cy], [-this.p.cx, 12]];
    }
    
    if (!this.p.alive) {     
      if(this.p.y > screenHeight * 2.0) { 
        this.buried = true; 
        this.destroy();
        
        Q.stageScene("endGame", 0);
        Q.stageScene(null, 3);  
      }   
    }
    
    if (this.p.alive) {      
      this.p.jumpCooldown -= dt;
    
      this.p.vx += (this.p.speed - this.p.vx)/4;
  
      if(this.p.y > screenHeight - this.p.cy) {
        this.p.y = screenHeight - this.p.cy;
        this.p.landed = true;
        this.p.vy = 0;
      } else {
        this.p.landed = false;
      }
      
      if (this.p.jumpCooldown < 0.0) {
        this.p.jumping = false;
      }

      if (this.p.vy < -50) {
        this.p.angle = -12;
      } else if (this.p.vy > 50) {
        this.p.angle = 15;
      } else {
        this.p.angle = 0;
      }
      
      if(Q.inputs['fire'] && this.p.y > this.p.h * 2.0 && this.p.jumpCooldown < 0.0) {
        this.p.vy = this.p.jump;
        this.p.jumpCooldown = this.p.jumpCooldownInterval;
        this.p.jumping = true;
      }
    }
    
    if (this.p.jumping === true) {
      this.play("jump_right");
    } else if (this.p.alive === true) {
      this.play("walk_right");
    } else {
      this.play("fall_right");
    }

    this.stage.viewport.centerOn(this.p.x + 300);
  }
});

Q.Sprite.extend("RaftTop", {
  init: function(p) {    
    var player = Q("Player").first();
    
    var pickedAsset = availableTopAssets[p.pickedAssetId];
    
    p.shelfPair.top = this;

    this._super({
      asset: pickedAsset.img,
      x: player.p.x + screenWidth + 500,
      type: SPRITE_BOX,
      shelfPair: p.shelfPair,
      collisionPolyPoints: null,
      passed: false,
      pickedAsset: pickedAsset
    });
    
    this.on("hit");
  },

  step: function(dt) {
    if (!this.p.collisionPolyPoints) {
      this.p.points = this.p.collisionPolyPoints = [[0, this.p.cy], [-this.p.cx, this.p.cy - this.p.cx], [-this.p.cx, -this.p.cy], [this.p.cx, -this.p.cy], [this.p.cx, this.p.cy - this.p.cx]];
    }
    
    this.p.y = this.p.cy;
    
    var player = Q("Player").first();
    if (player && player.p.x > this.p.x && !this.p.passed) {
      this.p.passed = true;
      
      player.p.score += 1;
      Q.stageScene("hud", 3, Q('Player').first().p);
    }
    
    if (!player || this.p.x < player.p.x - screenWidth) { this.destroy(); }    
  },
  
  hit: function() {
    var player = Q("Player").first();
    handlePlayerDying(player, this);
  }
});

Q.Sprite.extend("RaftBottom", {
  init: function(p) {    
    var player = Q("Player").first();
    
    var pickedAsset = availableBottomAssets[p.pickedAssetId];
    
    p.shelfPair.bottom = this;

    this._super({
      asset: pickedAsset.img,
      x: player.p.x + screenWidth + 500,
      scale: 0.45,
      type: SPRITE_BOX,
      shelfPair: p.shelfPair,
      pickedAsset: pickedAsset
    });
    
    this.on("hit");
  },

  step: function(dt) {
    this.p.y = screenHeight - this.p.cy * this.p.scale;
    
    var player = Q("Player").first();
    if (!player || this.p.x < player.p.x - Q.width) { this.destroy(); }
  },
  
  hit: function() {
    var player = Q("Player").first();
    handlePlayerDying(player, this);
  }
});

Q.GameObject.extend("RaftThrower", {
  init: function() {
    this.p = {
      launchDelay: 0.8,
      launchRandom: 0.8,
      launch: 2
    }
  },
  
  update: function(dt) {
    this.p.launch -= dt;
    
    var player = Q("Player").first();
    if (player.p.alive === false) {
      this.destroy();
      return;
    }

    if(this.p.launch < 0) {
      var assetId = Math.floor(Math.random() * availableTopAssets.length);
      var shelfPair = { top: null, bottom: null };
      
      this.stage.insert(new Q.RaftTop({pickedAssetId: assetId, shelfPair: shelfPair}));
      this.stage.insert(new Q.RaftBottom({pickedAssetId: assetId, shelfPair: shelfPair}));
      this.p.launch = this.p.launchDelay + this.p.launchRandom * Math.random();
    }
  }
});

Q.scene("intro", function (stage) {
  stage.insert(new Q.Repeater({ asset: "background-intro.jpg",
                                speedX: 0,
                                repeatY: false}));
  
  stage.insert(new Q.StaticBird({
    y: 160
  }));
  
  var container = stage.insert(new Q.UI.Container({
    y: 50,
    x: screenWidth * 0.5 
  }));

  stage.insert(new Q.UI.Text({
    label: "Zboară printre ofertele Auchan!",
      size: 30,
    color: "#ed1c24",
    x: 0,
    y: 0
  }), container);
    
  stage.insert(new Q.UI.Text({ 
    label: "Start competiție!\nDepășește cât mai multe obstacole,\nstrânge cât mai multe puncte și poți câștiga\nun voucher de cumpărături în valoare de 50 lei!",
    color: "#ed1c24",
    x: 0,
  size: 26,
    y: 240
  }), container);
  
  container.fit(20,20);
  
  stage.insert(new Q.UI.Button({
    label: "START",
    y: 500,
    x: screenWidth * 0.5 - 150,
    w: 240,
    h: 70,
      size: 60,
    fontColor: "#00a665",
    fill: "#ed1c24",
    radius: 0 
  }, function() {
      facebookLogin();
  }));

    stage.insert(new Q.UI.Button({
        label: "REGULAMENT",
        y: 500,
        x: screenWidth * 0.5 + 150,
        w: 240,
        h: 70,
        size: 60,
        fontColor: "#00a665",
        fill: "#ed1c24",
        radius: 0
    }, function() {
        var win = window.open("/terms.pdf", '_blank');
        win.focus();
    }));
});


Q.scene("endGame", function (stage) {
  getUserData();
  stage.insert(new Q.Repeater({ asset: "background-intro.jpg",
                                speedX: 0,
                                repeatY: false}));
  
  stage.insert(new Q.StaticBird({
    y: 40
  }));
  
  var pointsText = currentScore == 1 ? "punct" : "puncte";
  
  var container = stage.insert(new Q.UI.Container({
    y: 50,
    x: screenWidth * 0.5 
  }));
  
  stage.insert(new Q.UI.Text({ 
    label: currentScore > 0 ? ("Felicitări, ai obținut " + currentScore + " " + pointsText + "!") : "Din păcate nu ai acumulat niciun punct!",
    color: "black",
    x: 0,
    size: 30,
    y: 40
  }), container);
  
  stage.insert(new Q.UI.Text({ 
    label: "Joacă-te din nou pentru a intra în\ntop 21 de jucători!",
    size: 30,
    color: "black",
    x: 0,
    y: 160
  }), container);
  
  container.fit(20,20);
  
  stage.insert(new Q.UI.Button({
    label: "JOACĂ DIN NOU",
    y: 450,
    x: screenWidth * 0.5 - 150,
    w: 220,
    h: 60,
    fontColor: "#00a665",
    fill: "#ed1c24",
    radius: 0 
  }, function() {
    startGame();
  }));

    stage.insert(new Q.UI.Button({
        label: "CLASAMENT",
        y: 450,
        x: screenWidth * 0.5 + 150,
        w: 220,
        h: 60,
        fontColor: "#00a665",
        fill: "#ed1c24",
        radius: 0
    }, function() {
        startStandings();
    }));

    stage.insert(new Q.UI.Button({
        label: "INVITĂ-ȚI ȘI PRIETENII TĂI SĂ ZBOARE PRIN OFERTELE AUCHAN",
        y: 530,
        x: screenWidth * 0.5,
        w: 770,
        h: 60,
        fontColor: "#00a665",
        fill: "#ed1c24",
        radius: 0
    }, function() {
        FB.ui({
            method: 'share',
            href: 'https://www.facebook.com/AuchanRO/app_418402335027455'
        }, function(response){});
    }));
});

    Q.scene("standings", function (stage) {
        stage.insert(new Q.Repeater({ asset: "background-intro.jpg",
            speedX: 0,
            repeatY: false
        }));

        stage.insert(new Q.StaticBird({
            y: 40
        }));

        var container = stage.insert(new Q.UI.Container({
            y: 50,
            x: screenWidth * 0.5
        }));

        stage.insert(new Q.UI.IFrame({
            url: 'standings.php',
            w: 700,
            h: 340,
            x: 370,
            y: 330
        }), container);

        stage.insert(new Q.UI.Button({
            label: "JOACĂ DIN NOU",
            y: 540,
            x: screenWidth * 0.5,
            w: 220,
            h: 60,
            fontColor: "#00a665",
            fill: "#ed1c24",
            radius: 0
        }, function() {
            startGame();
        }));

    });


Q.scene("level1",function(stage) {
  stage.insert(new Q.Repeater({ asset: "background-mountains.png",
                                speedX: 0.6,
                                repeatY: false}));

  stage.insert(new Q.Player());
  stage.insert(new Q.RaftThrower());

  stage.add("viewport");
});

Q.scene('hud',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: 50, y: 0
  }));

  container.insert(new Q.UI.Text({
    x: 20, y: 20,
    label: "Scor: " + stage.options.score, color: "black" 
  }));
    
  container.fit(20);
});

Q.load(availableAssetsAsList + "bird.json, bird.png, background-mountains.png, background-intro.jpg", function() {
  Q.compileSheets("bird.png","bird.json");
  Q.animations("bird", {
    jump_right: { frames: [0,1,2,3], rate: 1/15, flip: false, loop: true },
    walk_right: { frames: [0,1,2,3], rate: 1/8, flip: false, loop: true },
    fall_right: { frames: [1], rate: 1/10, flip: false }
  });
  
  Q.stageScene("intro", 0);
});

Q.el.addEventListener('mousedown',function(e) {
    if (e.button !== 0) {
      return;
    }

    var actionName = 'fire';

    Q.inputs[actionName] = true;
    Q.input.trigger(actionName);
    Q.input.trigger('keydown',e.keyCode);
    e.preventDefault();
  }, false);

Q.el.addEventListener('mouseup',function(e) {
    if (e.button !== 0) {
      return;
    }
    
    var actionName = 'fire';

    Q.inputs[actionName] = false;
    Q.input.trigger(actionName + "Up");
    Q.input.trigger('keyup',e.keyCode);
    e.preventDefault();
  }, false);

// End of window.load event listener handler
});
