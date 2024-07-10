import * as lit from 'lit';
import { LitElement } from 'lit';

declare class AppShell extends LitElement {
    static styles: lit.CSSResult;
    name: string;
    render(): lit.TemplateResult<1>;
}

export { AppShell };
