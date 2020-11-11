import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {cloneDeep, omit} from 'lodash';
import {select, Store} from '@ngrx/store';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {AuthService} from '../../../services/gaurd/auth.service';
import * as fromRoot from '../../../states/reducers';
import {
  CreateCommonData,
  UpdateCommonData,
  DeleteCommonData
} from '../../../states/actions/common.actions';
import {COMMON_OMIT_FIELD} from '../../../common/default';
import {ModalComponent} from '../../../library/custom-modal/modal/modal.component';

const DEFAULT_DATA = {
  FirstName: '',
  LastName: '',
  ExT: '',
  Phone: '',
  Fax: '',
  email: '',
  phone2: ''
};

// let postData = {
//   FirstName: this.caseMFN,
//   LastName: this.caseMLN,
//   createdBy: this.loggedUserName,
//   // AgencyName:this.caseMngrAN,
//   ExT: this.caseMngrExt,
//   Phone: this.caseMngrPhone,
//   Fax: this.caseMngrFax,
//   email: this.caseMngrEmail,
//   phone2: this.caseMngrOtherPhone

// }

const OMIT_FIELDS = [...COMMON_OMIT_FIELD, 'CaseManagerId'];

@Component({
  selector: 'app-master-list-case-managers',
  templateUrl: './case-manager.component.html',
  styleUrls: ['./case-manager.component.scss']
})
export class CaseManagerMasterListComponent implements OnInit {
  activeModal: ModalComponent;

  saving: string;
  listData = []; // for list

  editRow: any;
  editData: any;

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  check_access_on_init = true;
  access_group_id = 'Administrator';
  acl_allow = {read: false, update: false, delete: false};

  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private store: Store<any>
  ) {
    if (this.check_access_on_init) {
      this.acl_allow = authService.checkOverallAccess(this.access_group_id);
      if (!this.acl_allow.read) {
        this.router.navigate(['/admin/page404']);
      }
    }
  }

  ngOnInit() {
    let link = this.location.path();
    this.authService.checkAndAddLink({
      link,
      title: 'Case Managers',
      type: 'admin',
      canClose: true
    });
    this.store
      .pipe(
        takeUntil(this._unsubscribeAll),
        select(fromRoot.getCommonSaving)
      )
      .subscribe(data => {
        if (this.saving === 'saving' && data === 'success') {
          if (this.activeModal) {
            this.activeModal.hide();
            this.activeModal = null;
          }
        }
        this.saving = data;
      });
    this.store
      .pipe(
        takeUntil(this._unsubscribeAll),
        select(fromRoot.getCommon)
      )
      .subscribe(data => {
        if (data.loaded) {
          this.listData = data.caseManagers;
        }
      });
  }

  addDataAction(content) {
    this.editRow = null;
    this.editData = cloneDeep(DEFAULT_DATA);
    content.show();
    this.activeModal = content;
  }

  updateDataAction(content, row) {
    this.editRow = row;
    this.editData = cloneDeep(omit(row, OMIT_FIELDS));
    content.show();
    this.activeModal = content;
  }

  deleteDataAction(content, row) {
    this.editRow = row;
    content.show();
    this.activeModal = content;
  }

  saveData() {
    if (this.editRow) {
      this.updateData();
    } else {
      this.addNewData();
    }
  }

  addNewData() {
    this.store.dispatch(new CreateCommonData({target: 'caseManagers', data: this.editData}));
  }

  updateData() {
    this.store.dispatch(
      new UpdateCommonData({
        target: 'caseManagers',
        idInfo: [this.editRow.CaseManagerId],
        idFields: ['CaseManagerId'],
        data: this.editData
      })
    );
  }

  deleteData() {
    this.store.dispatch(
      new DeleteCommonData({
        target: 'caseManagers',
        idInfo: [this.editRow.CaseManagerId],
        idFields: ['CaseManagerId']
      })
    );
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}