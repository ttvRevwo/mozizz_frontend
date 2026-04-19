from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from webdriver_manager.chrome import ChromeDriverManager
import time
import sys

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)

try:
    driver.get("http://localhost:5173")
    driver.maximize_window()
    wait = WebDriverWait(driver, 10)

    try:
        login_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//*[contains(text(), 'BEJELENTKEZÉS') or contains(text(), 'Bejelentkezés')]")))
        login_btn.click()
        
        inputs = wait.until(EC.presence_of_all_elements_located((By.TAG_NAME, "input")))
        inputs[0].send_keys("mozizz.hu@gmail.com")
        inputs[1].send_keys("M0zizzTeszt!")
        
        buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'BEJELENTKEZÉS') or contains(text(), 'Bejelentkezés')]")
        buttons[-1].click()
        time.sleep(3)
        print("Sikeres bejelentkezés.")
    except Exception as e:
        print(f"Nem sikerült bejelentkezni: {e}")
        driver.quit()
        sys.exit()

    try:
        profile_icon = wait.until(EC.presence_of_element_located((By.XPATH, "//*[local-name()='svg' and contains(@class, 'user-svg')]")))
        ActionChains(driver).move_to_element(profile_icon).click().perform()
        print("Profil ikon sikeresen megnyomva.")
    except Exception as e:
        print(f"Nem sikerült megnyomni a profil ikont: {e}")
        driver.quit()
        sys.exit()

    try:
        profile_link = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(@class, 'dropdown-item') and contains(text(), 'Profil')]")))
        driver.execute_script("arguments[0].click();", profile_link)
        print("Profil gomb sikeresen megnyomva.")
    except Exception as e:
        print(f"Nem sikerült megnyomni a profil gombot: {e}")
        driver.quit()
        sys.exit()

    time.sleep(2)

    try:
        cancel_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(@class, 'ticket-cancel-btn')]")))
        driver.execute_script("arguments[0].click();", cancel_btn)
        print("Lemondás gomb sikeresen megnyomva.")
    except Exception as e:
        print(f"Nem sikerült megnyomni a lemondás gombot: {e}")
        driver.quit()
        sys.exit()

    try:
        alert = wait.until(EC.alert_is_present())
        alert.accept()
        print("OK gomb sikeresen megnyomva a felugró ablakban.")
    except Exception as e:
        print(f"Nem sikerült leokézni a felugró ablakot: {e}")
        driver.quit()
        sys.exit()

    try:
        time.sleep(3)
        driver.save_screenshot("tests/booking_cancel_success.png")
        print("Képernyőkép elmentve, foglalás sikeresen lemondva.")
    except Exception as e:
        print(f"Hiba a képernyőkép mentésekor: {e}")

finally:
    time.sleep(2)
    driver.quit()