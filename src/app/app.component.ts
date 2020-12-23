import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { LOCAL_STORAGE, StorageService } from "ngx-webstorage-service";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]

  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  name = "Angular";

  constructor(
    @Inject(LOCAL_STORAGE) private storag: StorageService
    
  ) {}
}
