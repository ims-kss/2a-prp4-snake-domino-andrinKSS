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
        this.velocity = { x: 0, y: 0 }; // Startbewegung: nach rechts

        this.food = this.randomPosition(); // Zufällige Startposition für Futter
        this.score = 0;
        this.gameOver = false;

        // Tastatur- und Resize-Ereignisse registrieren
        this.bindEvents();

        // Speicher des Namens beim klicken auf den Button
        document.getElementById("saveScoreButton").addEventListener("click", () => {
            const name = document.getElementById("playerNameInput");
            const obj = {
                name: name.value || "Anonym",
                score: this.score,
                date: new Date().toISOString()
            };

            const scores = JSON.parse(localStorage.getItem("scores")) || [];
            scores.push(obj);
            localStorage.setItem("scores", JSON.stringify(scores));

            this.renderHighscores(); // Liste aktualisieren
        });

        // Steuerungsbuttons
        document.getElementById("upBtn")?.addEventListener("click", () => {
            if (this.velocity.y === 0) this.velocity = { x: 0, y: -1 };
        });
        document.getElementById("downBtn")?.addEventListener("click", () => {
            if (this.velocity.y === 0) this.velocity = { x: 0, y: 1 };
        });
        document.getElementById("leftBtn")?.addEventListener("click", () => {
            if (this.velocity.x === 0) this.velocity = { x: -1, y: 0 };
        });
        document.getElementById("rightBtn")?.addEventListener("click", () => {
            if (this.velocity.x === 0) this.velocity = { x: 1, y: 0 };
        });

        // Spielfeld an Bildschirmgrösse anpassen
        this.resizeCanvas();

        // Spielzyklus alle 100ms
        this.loop = setInterval(this.update.bind(this), 100);

        // Bestenliste anzeigen
        this.renderHighscores();
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
            clearInterval(this.loop);

            // Game-Over-Dialog anzeigen und Score setzen
            document.getElementById("finalScore").textContent = this.score;
            document.getElementById("gameOverMessage").style.display = "flex";
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

    // Bestenliste anzeigen
    renderHighscores() {
        const highscoreList = document.getElementById("highscoreList");
        highscoreList.innerHTML = "";

        const scores = JSON.parse(localStorage.getItem("scores")) || [];

        // Sortieren: nach Score absteigend, bei Gleichstand: älterer zuerst
        scores.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(a.date) - new Date(b.date);
        });

        const maxEntries = 5; // oder dynamisch: Math.floor(window.innerHeight / 100);
        const topScores = scores.slice(0, maxEntries);

        topScores.forEach(entry => {
            const li = document.createElement("li");
            li.textContent = `${entry.name}: ${entry.score} Punkte – ${new Date(entry.date).toLocaleString()}`;
            highscoreList.appendChild(li);
        });
    }

}

// Startet das Spiel nach dem Laden der Seite
window.onload = () => {
    new SnakeGame("gameCanvas", "score");
};
