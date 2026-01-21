/**
 * API Key Dialog Component
 * Initial setup dialog for API key configuration
 */
import { LitElement } from 'lit';
export declare class ApiKeyDialog extends LitElement {
    static styles: import("lit").CSSResult;
    private apiKey;
    private showKey;
    private error;
    private handleSubmit;
    private handleKeydown;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'api-key-dialog': ApiKeyDialog;
    }
}
//# sourceMappingURL=api-key-dialog.d.ts.map