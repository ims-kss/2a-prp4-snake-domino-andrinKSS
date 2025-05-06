class SnakeGame {




    constructor(canvasId, scoreId) {



        // pause machen
        this.isPaused = false;





        // Canvas- und Score-Elemente abrufen
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext("2d");
        this.scoreElement = document.getElementById(scoreId);

        // Spielfeldgrösse: 20x20 Felder
        this.tileCount = 20;
        this.tileSize = this.canvas.width / this.tileCount;

        // Schlange beginnt in der Mitte des Feldes
        this.snake = [{ x: 10, y: 10 }];
        this.velocity = { x: 0, y: 0 }; // Startbewegung: stillstehend

        this.food = this.randomPosition(); // Zufällige Startposition für Futter
        this.score = 0;
        this.gameOver = false;

        // Tastatur- und Resize-Ereignisse registrieren
        this.bindEvents();

        // Spielfeld an Bildschirmgrösse anpassen
        this.resizeCanvas();

        // Spielzyklus alle 100ms
        this.loop = setInterval(this.update.bind(this), 100);


    }

    // Passt die Grösse des Spielfelds an die Fenstergrösse an (max. 600px)
    resizeCanvas() {
        const size = Math.min(window.innerWidth, 600);
        this.canvas.width = size;
        this.canvas.height = size;

        // Neue Kachelgrösse berechnen
        this.tileSize = this.canvas.width / this.tileCount;

        // Neuzeichnen nach Grössenänderung
        this.draw();
    }

    // Tasteneingaben und Fenstergrössenänderungen behandeln
    bindEvents() {
        window.addEventListener("keydown", this.handleKey.bind(this));
        window.addEventListener("resize", this.resizeCanvas.bind(this));
    }

    // Pfeiltasten zur Steuerung der Schlange
    handleKey(e) {
        const { x, y } = this.velocity;

        // Erweiterung der Pause-Funktion
        if (e.key === " ") {
            this.isPaused = !this.isPaused; // Pause umschalten
            return;
        }
        // Keine 180°-Wende zulassen
        switch (e.key) {
            case "ArrowUp": if (y === 0) this.velocity = { x: 0, y: -1 }; break;
            case "ArrowDown": if (y === 0) this.velocity = { x: 0, y: 1 }; break;
            case "ArrowLeft": if (x === 0) this.velocity = { x: -1, y: 0 }; break;
            case "ArrowRight": if (x === 0) this.velocity = { x: 1, y: 0 }; break;
        }
    }

    // Spielzyklus: Bewegungslogik, Kollisionen, Zeichnen
    update() {
        //Erweiterung der Pause-Funktion
        if (this.gameOver || this.isPaused) return;

        // Neuer Kopf basierend auf aktueller Richtung
        const head = { ...this.snake[0] };
        head.x += this.velocity.x;
        head.y += this.velocity.y;

        // Überprüfung auf Kollision (Wand oder sich selbst)
        if (this.isCollision(head)) {
            this.gameOver = true;
            alert("Game Over! Punkte: " + this.score);
            clearInterval(this.loop);
            return;
        }

        // Neuen Kopf zur Schlange hinzufügen
        this.snake.unshift(head);

        // Überprüfen, ob Futter gefressen wurde
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++; // Punktestand erhöhen
            this.food = this.randomPosition(); // Neues Futter platzieren
        } else {
            // Kein Futter: Letztes Segment entfernen
            this.snake.pop();
        }

        // Spielfeld neu zeichnen
        this.draw();
    }

    // Prüft, ob Schlange aus dem Feld läuft oder sich selbst trifft
    isCollision(pos) {
        return (
            pos.x < 0 || pos.x >= this.tileCount ||
            pos.y < 0 || pos.y >= this.tileCount ||
            this.snake.slice(1).some(segment => segment.x === pos.x && segment.y === pos.y)
        );
    }

    // Generiert zufällige Position für das Futter (nicht auf Schlange)
    randomPosition() {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === position.x && segment.y === position.y));
        return position;
    }

    // Zeichnet Spielfeld, Schlange, Futter und Punktestand
    draw() {
        // Hintergrund schwarz zeichnen
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Schlange zeichnen (grün)
        this.context.fillStyle = "#0f0";
        this.snake.forEach(segment => {
            this.context.fillRect(
                segment.x * this.tileSize,
                segment.y * this.tileSize,
                this.tileSize,
                this.tileSize
            );
        });

        // Futter zeichnen (rot)
        this.context.fillStyle = "#f00";
        this.context.fillRect(
            this.food.x * this.tileSize,
            this.food.y * this.tileSize,
            this.tileSize,
            this.tileSize
        );

        // Punktestand aktualisieren
        this.scoreElement.textContent = "Punkte: " + this.score;
    }


}

// Startet das Spiel nach dem Laden der Seite
window.onload = () => {
    new SnakeGame("gameCanvas", "score");
};