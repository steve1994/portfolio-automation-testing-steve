import { type Locator, type Page } from '@playwright/test';

/**
 * Page Object Model untuk halaman Manajemen Tag (/contact/tags).
 *
 * Lokator disusun berdasarkan deskripsi langkah-langkah (Steps)
 * test case AgentQ ID 34-42 (Create, Edit, Delete Tag) serta pola POM
 * yang sudah ada di login.page.ts dan register.page.ts.
 *
 * CATATAN: Lokator harus divalidasi/direfine dengan Playwright Codegen
 * terhadap UI aktual (https://www.emra.chat).
 */
export class TagPage {
  readonly page: Page;

  // ===================== Navigasi =====================
  readonly tagsMenuLink: Locator;

  // ===================== Halaman Daftar Tag (/contact/tags) =====================
  readonly createTagButton: Locator;
  readonly tagTable: Locator;
  readonly tagRows: Locator;

  // ===================== Form Buat / Edit Tag (Modal) =====================
  readonly tagNameInput: Locator;
  readonly tagColorSelect: Locator;
  readonly createTagInModalButton: Locator;
  readonly updateTagButton: Locator;

  // ===================== Aksi pada kolom Action (daftar tag) =====================
  readonly editTagIcon: Locator; // pensil
  readonly deleteTagIcon: Locator; // tong sampah

  // ===================== Konfirmasi Hapus =====================
  readonly confirmDeleteButton: Locator; // tombol "OK" pada alert konfirmasi

  // ===================== Pesan Error / Alert =====================
  readonly alertMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigasi
    this.tagsMenuLink = page.getByRole('link', { name: /Tags/i });

    // Daftar tag
    this.createTagButton = page.getByRole('button', { name: 'Create Tag' });
    this.tagTable = page.getByRole('table');
    this.tagRows = page.getByRole('row');

    // Form tag (modal)
    this.tagNameInput = page.getByRole('textbox', { name: 'Tag Name' });
    this.tagColorSelect = page.getByRole('combobox', { name: /Color/i });
    this.createTagInModalButton = page.getByRole('button', { name: 'Create Tag' });
    this.updateTagButton = page.getByRole('button', { name: 'Update Tag' });

    // Ikon aksi pada daftar tag
    this.editTagIcon = page.getByRole('img', { name: /Edit/i });
    this.deleteTagIcon = page.getByRole('img', { name: /Delete/i });

    // Konfirmasi hapus
    this.confirmDeleteButton = page.getByRole('button', { name: /OK/i });

    // Pesan error / alert
    this.alertMessage = page.getByRole('alert');
  }

  // ===================== Aksi Navigasi =====================
  async gotoTags() {
    await this.page.goto('/contacts/tags');
    await this.page.waitForURL('**/contacts/tags');
  }

  // ===================== Aksi Tag =====================
  async clickCreateTag() {
    await this.createTagButton.click();
  }

  async fillTagName(name: string) {
    await this.tagNameInput.fill(name);
  }

  async clearTagName() {
    await this.tagNameInput.fill('');
  }

  async selectTagColor(color: string) {
    await this.tagColorSelect.selectOption(color);
  }

  async clickCreateTagInModal() {
    await this.createTagInModalButton.click();
  }

  async clickUpdateTag() {
    await this.updateTagButton.click();
  }

  // Aksi berdasarkan nama tag pada baris tabel (row)
  async clickEditTag(tagName: string) {
    const row = this.page.getByText(tagName);
    await row.scrollIntoViewIfNeeded();
    await row.locator(this.editTagIcon).first().click();
  }

  async clickDeleteTag(tagName: string) {
    const row = this.page.getByText(tagName);
    await row.scrollIntoViewIfNeeded();
    await row.locator(this.deleteTagIcon).first().click();
  }

  async clickConfirmDelete() {
    await this.confirmDeleteButton.click();
  }

  tagRow(tagName: string): Locator {
    // return this.page.getByRole('row', { name: tagName });
    return this.page.getByText(tagName);
  }
}
