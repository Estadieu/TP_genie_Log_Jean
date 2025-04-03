//Jean ESTADIEU
//03/04/2025
//Creation poly avec plusieurs etats + Exo Cours
import { createMachine, interpret } from "xstate";
import Konva from "konva";

const stage = new Konva.Stage({
    container: "container",
    width: 400,
    height: 400,
});

const layer = new Konva.Layer();
stage.add(layer);

const MAX_POINTS = 10;
let polyline; // La polyline en cours de construction

const polylineMachine = createMachine(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QAcD2AbAngGQJYDswA6XCdMAYgFkB5AVQGUBRAYWwEkWBpAbQAYAuohSpYuAC65U+YSAAeiACwAOAJxEAjIoBMGjX219FGwwGYANCEyIAbH2WaNAdhentqxauUqAvj8toWHiERBAATgCGAO4EUNT0zLQAakz8QkggaGKS0rIKCNqKTkTaynxeAKwViqaKfC7KltYIFaYVmtpOHqZGKuWmfgEYOATE4dGxsACuEpQAQhEAxgDWsMhLYGmyWRJSMhn5ALQ2bY5lHk6epjbK2k2Ite21hhWqLoonujaDmcPBY5EYvgoNNZhQmPhxGAwlsMjscvtQEceu1VNc+OVPKpXid7ghHkRnnxXu9Phpvv5fkFRqFAZMZlDwbBFhFkJtBNtRLtcgcHjYiDY0WjlDZjKVhXi6vzTBo3soKtpTN4NGpFD9AiMQuMgXFaIxWBxuLCRNk9nlEIctMUjE5lLcPAqTkq8TZFSVTLaVE59J1Ouq-jTtfSwXrEjQUsbfqaeUiLRUykQKrb+hoKr1tDY8UmHD0vPYca03P7qVq6cDQYzQwbOLwOXCuQjzQhDj0HHxBRiKhoZV07lZEE4+KYBYPiVcKoKBpSNf9aRNywzKFW2DWeBp0ibuYj5IgVYpCeSvLabE5Cra8d52oYMaZVHZc7K-JT8KgIHBOSWwJzo9ujjdh3o5xFFcNx9s02hJkQp51K8Z6CtoEHFpqxCkOQ35bk2doODYryqHmp63s4konEQKgyjiigTqK3hIbOQbAuhja8s2gqEjhXiPHoRhdlm3ZEL0fCyu2XoZrRgZliCi6MWazEtk4TyKneJjek48G8cOAlCdRp4Un4QA */
        id: "polyLine",
        initial: "idle",
        states: {
            idle: {
                on: {
                    MOUSECLICK: {
                        target: "drawing",
                        actions: ["createLine"],
                    }
                },
            },

            drawing: {
                on: {
                    MOUSECLICK: {
                        target: "drawingsuite",
                        actions: "addPoint"
                    },

                    MOUSEMOVE: {
                        target: "drawing",
                        internal: true,
                        actions: ["setLastPoint"],
                    }
                },
            },

            drawingsuite: {
                on: {
                    Backspace: {
                        target: "drawingsuite",
                        actions: ["removeLastPoint"],
                        guard: "plusDeDeuxPoints",
                        internal: true
                    },

                    Enter: {
                        target: "idle",
                        actions: ["saveLine"],
                        guard: "plusDeDeuxPoints"
                    },

                    Escape: {
                        target: "idle",
                        actions: ["abandon"],
                        cond: "plusDeDeuxPoints"
                    },

                    MOUSECLICK: [{
                        target: "drawingsuite",
                        cond: "pasPlein",
                        actions: "addPoint",
                        internal: true
                    }, {
                        target: "idle",
                        actions: "saveLine"
                    }],

                    MOUSEMOVE: {
                        target: "drawingsuite",
                        actions: "setLastPoint",
                        internal: true
                    }
                }
            }
        },
    },
    {
        actions: {
            createLine: (context, event) => {
                const pos = stage.getPointerPosition();
                polyline = new Konva.Line({
                    points: [pos.x, pos.y, pos.x, pos.y],
                    stroke: "red",
                    strokeWidth: 2,
                });
                layer.add(polyline);
            },
            setLastPoint: (context, event) => {
                const pos = stage.getPointerPosition();
                const currentPoints = polyline.points();
                const size = currentPoints.length;

                const newPoints = currentPoints.slice(0, size - 2);
                polyline.points(newPoints.concat([pos.x, pos.y]));
                layer.batchDraw();
            },
            saveLine: (context, event) => {
                const currentPoints = polyline.points();
                const size = currentPoints.length;
                const newPoints = currentPoints.slice(0, size - 2);
                polyline.points(newPoints);
                polyline.stroke("black");
                layer.batchDraw();
            },
            addPoint: (context, event) => {
                const pos = stage.getPointerPosition();
                const currentPoints = polyline.points();
                const newPoints = [...currentPoints, pos.x, pos.y];
                polyline.points(newPoints);
                layer.batchDraw();
            },
            abandon: (context, event) => {
                polyline.remove();
            },
            removeLastPoint: (context, event) => {
                const currentPoints = polyline.points();
                const size = currentPoints.length;
                const provisoire = currentPoints.slice(size - 2, size);
                const oldPoints = currentPoints.slice(0, size - 4);
                polyline.points(oldPoints.concat(provisoire));
                layer.batchDraw();
            },
        },
        guards: {
            pasPlein: (context, event) => {
                return polyline.points().length < MAX_POINTS * 2;
            },
            plusDeDeuxPoints: (context, event) => {
                return polyline.points().length >= 6;
            },
        },
    }
);

const polylineService = interpret(polylineMachine)
    .onTransition((state) => {
        console.log("Current state:", state.value);
    })
    .start();

stage.on("click", () => {
    polylineService.send("MOUSECLICK");
});

stage.on("mousemove", () => {
    polylineService.send("MOUSEMOVE");
});

window.addEventListener("keydown", (event) => {
    console.log("Key pressed:", event.key);
    polylineService.send(event.key);
});
