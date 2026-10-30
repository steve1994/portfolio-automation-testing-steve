import { type Locator, type Page } from '@playwright/test';

/**
 * Page Object Model untuk halaman Manajemen Kontak (/contacts) dan Detail Kontak.
 *
 * Lokator di bawah ini disusun berdasarkan deskripsi langkah-langkah (Steps)
 * test case AgentQ ID 26-44 serta pola POM yang sudah ada di login.page.ts
 * dan register.page.ts (menggunakan getByRole sebagai lokator optimum).
 *
 * CATATAN: Lokator harus divalidasi/direfine dengan Playwright Codegen
 * terhadap UI aktual (https://www.emra.chat) karena implementasi DOM
 * dapat bervariasi.
 */
export class ContactPage {
  readonly page: Page;

  // ===================== Navigasi =====================
  readonly contactsMenuLink: Locator;
  readonly tagsMenuLink: Locator;

  // ===================== Halaman Daftar Kontak (/contacts) =====================
  readonly addContactButton: Locator;
  readonly contactTable: Locator;
  readonly contactRows: Locator;

  // ===================== Form Tambah / Edit Kontak (Basic Information) =====================
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly createContactButton: Locator;
  readonly saveChangesButton: Locator;
  readonly cancelButton: Locator;

  // ===================== Aksi pada kolom Action (daftar kontak) =====================
  // Ikon: mata (view), pensil (edit), tong sampah (delete)
  readonly viewContactIcon: Locator;
  readonly editContactIcon: Locator;
  readonly deleteContactIcon: Locator;

  // ===================== Halaman Detail Kontak =====================
  readonly contactDetailHeading: Locator;
  readonly deleteContactButton: Locator; // tombol "Delete" di halaman detail

  // ===================== Konfirmasi Hapus =====================
  readonly confirmDeleteButton: Locator; // tombol "OK" pada alert konfirmasi

  // ===================== Pesan Error / Alert =====================
  readonly alertMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigasi
    this.contactsMenuLink = page.getByRole('link', { name: /Contacts/i });
    this.tagsMenuLink = page.getByRole('link', { name: /Tags/i });

    // Daftar kontak
    // Lokator "+ Add Contact" disusun dengan regex fleksibel karena teks aktual
    // pada UI dapat bervariasi (contoh: "Add Contact" tanpa "+", atau elemen
    // berupa <a> bukan <button>). Dicoba role button terlebih dahulu, lalu link.
    this.addContactButton = page.getByRole('button', { name: 'Add Contact' });
    this.contactTable = page.getByRole('table');
    this.contactRows = page.getByRole('row');

    // Form kontak (Basic Information)
    this.nameInput = page.getByRole('textbox', { name: /Name/i });
    this.emailInput = page.getByRole('textbox', { name: /Primary Email/i });
    this.phoneInput = page.getByRole('textbox', { name: /Primary Phone/i });
    this.createContactButton = page.getByRole('button', { name: 'Create Contact' });
    this.saveChangesButton = page.getByRole('button', { name: 'Save Changes' });
    this.cancelButton = page.getByRole('button', { name: /Cancel/i });

    // Ikon aksi pada daftar kontak
    this.viewContactIcon = page.getByRole('button').filter({ hasText: /^$/ });
    this.editContactIcon = page.getByRole('button').filter({ hasText: /^$/ });
    this.deleteContactIcon = page.getByRole('button', { name: 'Delete' });

    // Halaman detail kontak
    this.contactDetailHeading = page.getByText('Contact Details');
    this.deleteContactButton = page.getByRole('button', { name: 'Delete' });

    // Konfirmasi hapus
    this.confirmDeleteButton = page.getByRole('button', { name: /OK/i });

    // Pesan error / alert (toast atau inline)
    this.alertMessage = page.getByRole('alert');
  }

  // ===================== Aksi Navigasi =====================
  async gotoContacts() {
    await this.page.goto('/contacts');
    await this.page.waitForURL('**/contacts');
  }

  async gotoTags() {
    await this.page.goto('/contacts/tags');
    await this.page.waitForURL('**/contacts/tags');
  }

  // ===================== Aksi Kontak =====================
  async clickAddContact() {
    await this.addContactButton.click();
  }

  async fillContactInformation(name: string, email: string, phone: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPhone(phone: string) {
    await this.phoneInput.fill(phone);
  }

  async clearField(locator: Locator) {
    await locator.fill('');
  }

  async clickCreateContact() {
    await this.createContactButton.click();
  }

  async clickSaveChanges() {
    await this.saveChangesButton.click();
  }

  async clickDelete() {
    await this.deleteContactButton.click();
  }

  async clickConfirmDelete() {
    await this.confirmDeleteButton.click();
  }

  // Aksi berdasarkan nama kontak pada baris tabel (row)
  async clickViewContact(contactName: string) {
    await this.viewContactIcon.first().click();
  }

  async clickEditContact(contactName: string) {
    await this.editContactIcon.nth(1).click();
  }

  async clickDeleteContact(contactName: string) {
    this.page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await this.deleteContactButton.click();
  }

  contactRow(contactName: string): Locator {
    return this.page.getByRole('row', { name: contactName });
  }
}
