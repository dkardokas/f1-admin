import { IF1Race } from "../components/F1Admin";

export default class F1PointCalculator {
    private _race: IF1Race;

    constructor(race: IF1Race) {
        this._race = race;
    }

    public getPointsForPlace(position: number, driverId: number): number {
        let points: number = 0;
        if (this._race["P_" + position + "Id"] == driverId)
            points = 20;
        else if (this._race["P_" + (position + 1) + "Id"] == driverId || this._race["P_" + (position - 1) + "Id"] == driverId)
            points = 10;
        else if (this._race["P_" + (position + 2) + "Id"] == driverId || this._race["P_" + (position - 2) + "Id"] == driverId)
            points = 5;
        else if (this._race["P_" + (position + 3) + "Id"] == driverId || this._race["P_" + (position - 3) + "Id"] == driverId)
            points = 2;
        else if (this._race["P_" + (position + 4) + "Id"] == driverId || this._race["P_" + (position - 4) + "Id"] == driverId)
            points = 1;

        if (position == 1 && points == 20)
            points = 30;

        if ((position == 4 || position == 5) && points == 20)
            points = 15;

        return points;

    }
}