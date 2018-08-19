import * as React from 'react';
import styles from './F1Admin.module.scss';
import { IF1AdminProps } from './IF1AdminProps';
import { Fabric, DefaultButton, PrimaryButton, autobind } from 'office-ui-fabric-react';
import { ListService } from '../common/services/ListService';
import { Dropdown, IDropdown, DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import F1PointCalculator from '../common/F1PointCalculator';

export interface IF1RaceList {
  value: IF1Race[];
}
export interface IF1Race {
  Title: string;
  RaceDate: string;
  Id: number;
  P_1Id: number;
  P_2Id: number;
  P_3Id: number;
  P_4Id: number;
  P_5Id: number;
  P_6Id: number;
  P_7Id: number;
  P_8Id: number;
  P_9Id: number;
}
export interface IF1Driver {
  Title: string;
  Team: string;
}

export default class F1Admin extends React.Component<IF1AdminProps, any> {
  private LIST_TITLE_RACES: string = "F1_Races";
  private LIST_TITLE_ENTRIES: string = "F1_Entries";
  private LIST_TITLE_DRIVERS: string = "F1_Drivers";

  private _listService: ListService;
  private _webUrl: string;

  constructor(props) {
    super(props);
    this._listService = new ListService(this.props.context.spHttpClient);
    this._webUrl = this.props.context.pageContext.web.absoluteUrl;
    this.state = {
      raceList: [],
      calculateRace: null
    };
  }

  public componentDidMount() {
    this._getRaceList().then(raceresponse => {
      var loadedRaces = [];
      raceresponse.value.forEach(element => {
        element.key = element.Id;
        element.text = element.Title
        loadedRaces.push(element);
      });

      this.setState(() => {
        return {
          raceList: loadedRaces
        }
      });
    });
  }

  public render(): React.ReactElement<IF1AdminProps> {
    return (
      <div className={styles.f1Admin}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.column}>
              <Dropdown
                label='Race'
                options={this.state.raceList}
                onChanged={(item) => this._raceSelected(item)}
              />
              <PrimaryButton
                onClick={this._calculatePoints}
                text="Calculate Result"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  @autobind
  private _calculatePoints(): void {
    this._getEntriesForRace(this.state.calculateRace.text).then(entriesResponse =>{      
      let pointCalculator:F1PointCalculator = new F1PointCalculator(this.state.calculateRace);
      entriesResponse.value.forEach(element => {
        let p1Points:number = pointCalculator.getPointsForPlace(1, element.Entry_P1Id);
        let p2Points:number = pointCalculator.getPointsForPlace(2, element.Entry_P2Id);
        let p3Points:number = pointCalculator.getPointsForPlace(3, element.Entry_P3Id);
        let p4Points:number = pointCalculator.getPointsForPlace(4, element.Entry_P4Id);
        let p5Points:number = pointCalculator.getPointsForPlace(5, element.Entry_P5Id);
        this._updateEntryPoints(element.Id, p1Points, p2Points, p3Points, p4Points, p5Points);
      });
      
    })    
  }

  private _updateEntryPoints(itemId, p1Points, p2Points, p3Points, p4Points, p5Points ): Promise<any>{
    var updateData = {
      Points_P1: p1Points,
      Points_P2: p2Points,
      Points_P3: p3Points,
      Points_P4: p4Points,
      Points_P5: p5Points,
      ShowInResults: true
    };

    return this._listService.updateItem(this._webUrl, this.LIST_TITLE_ENTRIES, itemId, updateData)
  }

  @autobind
  private _raceSelected(selectedRace): void {
    this.setState(() => {
      return {
        calculateRace: selectedRace
      }
    });
  }

  private _getRaceList(): Promise<any> {
    let q: string = `<View><Query><OrderBy><FieldRef Name='Date' Ascending='True' /></OrderBy></Query></View>`;

    return this._listService.getListItemsByQuery(this._webUrl, this.LIST_TITLE_RACES, q);
  }

  private _getEntriesForRace(raceTitle:string): Promise<any> {
    let q: string = `<View><Query><Where>
    <Eq>
       <FieldRef Name='Race' />
       <Value Type='Lookup'>` + raceTitle + `</Value>
    </Eq>
 </Where><OrderBy><FieldRef Name='Date' Ascending='True' /></OrderBy></Query></View>`;

    return this._listService.getListItemsByQuery(this._webUrl, this.LIST_TITLE_ENTRIES, q);
  }
}
