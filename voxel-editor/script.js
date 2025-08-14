        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        let camera, scene, renderer, controls, gridHelper; 
        let plane; 
        let pointer, raycaster, isShiftDown = false, isAltDown = false, isRightMouseDown = false, isAltLeftMouseDown = false;
        let currentDragDeleteData = [];
        let dragProcessedCubes = new Set(); 

        let isPotentialSimpleClick = false;
        const pointerDownScreenCoords = new THREE.Vector2();
        let potentialSimpleClickPlacementPosition = null;
        const DRAG_THRESHOLD_SQ = 10 * 10; 


        let rollOverMesh, rollOverMaterial; 
        let cubeGeo; 

        const objects = []; 
        let currentHexColor = 0xff0000; 
        let lastPlacedCubePosition = null; 
        
        let selectedObjects = [];
        const selectedMaterial = new THREE.MeshLambertMaterial({ color: 0x00FFFF, opacity: 0.7, transparent: true, emissive: 0x112222 });

        let gridSize = 20; 
        const cubeSize = 1; 
        let gridDivisions = gridSize / cubeSize; 

        const historyStack = [];
        const redoStack = []; 
        const MAX_HISTORY_STATES = 20;
        let selectionShouldBePreservedAfterMessage = false; 
        let preventCubePlacementAfterMessage = false; 
        let currentTheme = 'light'; 

        let currentLanguage = 'en'; 
        const uiStrings = {
            fa: {
                languageToggle: "Switch to English",
                darkModeToggleLight: "حالت تاریک",
                darkModeToggleDark: "حالت روشن",
                controlsMainTitle: "کنترل‌ها",
                controlsTitleColors: "انتخاب رنگ:",
                defaultColorsTitle: "رنگ‌های پیش‌فرض:",
                customColorsTitle: "رنگ‌های سفارشی:",
                addCustomColor: "افزودن رنگ",
                gridSizeTitle: "ابعاد شبکه (10-50):",
                applyGridSize: "اعمال",
                operationsTitle: "عملیات:",
                copySelected: "کپی انتخاب شده",
                deleteSelected: "حذف انتخاب شده",
                undo: "بازگشت (Undo)",
                redo: "انجام مجدد (Redo)",
                clearAll: "پاک کردن همه",
                importExportTitle: "ورود/خروج:",
                exportOBJ: "خروجی OBJ",
                exportJSON: "خروجی JSON",
                importJSON: "ورود JSON",
                instructionsTitle: "راهنما",
                msgOk: "باشه",
                msgConfirmYes: "بله",
                msgConfirmNo: "خیر",
                msgNoUndo: "عملی برای بازگشت وجود ندارد.",
                msgNoRedo: "عملی برای انجام مجدد وجود ندارد.",
                msgInvalidGridSize: "اندازه شبکه باید بین 10 و 50 باشد.",
                msgGridSizeConflict: "تغییر ابعاد امکان‌پذیر نیست: برخی مکعب‌ها خارج از محدوده جدید قرار می‌گیرند.",
                msgInvalidColorCode: "کد رنگ نامعتبر است.",
                msgColorExists: "این رنگ از قبل در پالت وجود دارد.",
                msgNothingToClear: "چیزی برای پاک کردن وجود ندارد.",
                msgConfirmClearAll: "آیا مطمئن هستید که می‌خواهید همه مکعب‌ها را پاک کنید؟ این عمل قابل بازگشت نیست.",
                msgNothingToCopy: "هیچ مکعبی برای کپی انتخاب نشده است.",
                msgCopyFailedOutOfBounds: "کپی امکان‌پذیر نیست: خارج از محدوده.",
                msgNothingToDelete: "هیچ مکعبی برای حذف انتخاب نشده است.",
                msgMoveFailedOutOfBounds: "حرکت امکان‌پذیر نیست: خارج از محدوده.", 
                msgCantPlaceCube: "نمی‌توانید مکعب را در اینجا قرار دهید: همپوشانی دارد.",
                msgImportError: "خطا در ورود فایل JSON.",
                msgImportSuccess: "فایل JSON با موفقیت وارد شد.",
                removeColorTitle: "حذف این رنگ",
                customColorNamePrefix: "سفارشی",
                instructionsList: [
                    "<strong>چپ کلیک:</strong> اضافه کردن مکعب",
                    "<strong>Shift + چپ کلیک:</strong> کشیدن خطی از مکعب‌ها",
                    "<strong>Alt + چپ کلیک (نگه داشتن و کشیدن):</strong> انتخاب/لغو انتخاب چند مکعب",
                    "<strong>راست کلیک:</strong> حذف مکعب",
                    "<strong>Shift + راست کلیک (نگه داشتن و کشیدن):</strong> حذف چند مکعب",
                    "<strong>کلیدهای جهت‌نما / PageUp / PageDown:</strong> جابجایی مکعب(های) انتخاب شده",
                    "<strong>Escape / Enter:</strong> لغو انتخاب همه / بستن پیام",
                    "<strong>Ctrl/Cmd + Z:</strong> بازگشت به حرکت قبل (Undo)",
                    "<strong>Ctrl/Cmd + Y:</strong> انجام مجدد حرکت (Redo)",
                    "<strong>چرخاندن دوربین:</strong> نگه داشتن کلیک چپ و حرکت ماوس",
                    "<strong>بزرگنمایی/کوچک نمایی:</strong> اسکرول ماوس",
                    "<strong>جابجایی دوربین:</strong> نگه داشتن کلیک راست و حرکت ماوس (یا کلیک وسط)"
                ],
                colorNames: { red: 'قرمز', green: 'سبز', blue: 'آبی', yellow: 'زرد', cyan: 'فیروزه‌ای', orange: 'نارنجی', white: 'سفید', lightGray: 'خاکستری روشن', darkGray: 'خاکستری تیره', brown: 'قهوه‌ای'}
            },
            en: {
                languageToggle: "تغییر به فارسی",
                darkModeToggleLight: "Dark Mode",
                darkModeToggleDark: "Light Mode",
                controlsMainTitle: "Controls",
                controlsTitleColors: "Select Color:",
                defaultColorsTitle: "Default Colors:",
                customColorsTitle: "Custom Colors:",
                addCustomColor: "Add Color",
                gridSizeTitle: "Grid Size (10-50):",
                applyGridSize: "Apply",
                operationsTitle: "Operations:",
                copySelected: "Copy Selected",
                deleteSelected: "Delete Selected",
                undo: "Undo",
                redo: "Redo",
                clearAll: "Clear All",
                importExportTitle: "Import/Export:",
                exportOBJ: "Export OBJ",
                exportJSON: "Export JSON",
                importJSON: "Import JSON",
                instructionsTitle: "Instructions",
                msgOk: "OK",
                msgConfirmYes: "Yes",
                msgConfirmNo: "No",
                msgNoUndo: "No action to undo.",
                msgNoRedo: "No action to redo.",
                msgInvalidGridSize: "Grid size must be between 10 and 50.",
                msgGridSizeConflict: "Cannot change dimensions: Some cubes would be outside the new bounds.",
                msgInvalidColorCode: "Invalid color code.",
                msgColorExists: "This color already exists in the palette.",
                msgNothingToClear: "Nothing to clear.",
                msgConfirmClearAll: "Are you sure you want to clear all cubes? This action cannot be undone.",
                msgNothingToCopy: "No cubes selected to copy.",
                msgCopyFailedOutOfBounds: "Cannot copy: Out of bounds.", 
                msgNothingToDelete: "No cubes selected to delete.",
                msgMoveFailedOutOfBounds: "Cannot move: Out of bounds.", 
                msgCantPlaceCube: "Cannot place cube here: Overlap.",
                msgImportError: "Error importing JSON file.",
                msgImportSuccess: "JSON file imported successfully.",
                removeColorTitle: "Remove this color",
                customColorNamePrefix: "Custom",
                 instructionsList: [
                    "<strong>Left Click:</strong> Add cube",
                    "<strong>Shift + Left Click:</strong> Draw line of cubes",
                    "<strong>Alt + Left Click (Hold & Drag):</strong> Select/Deselect multiple cubes",
                    "<strong>Right Click:</strong> Delete cube",
                    "<strong>Shift + Right Click (Hold & Drag):</strong> Delete multiple cubes",
                    "<strong>Arrow Keys / PageUp / PageDown:</strong> Move selected cube(s)",
                    "<strong>Escape / Enter:</strong> Deselect all / Close message",
                    "<strong>Ctrl/Cmd + Z:</strong> Undo last action",
                    "<strong>Ctrl/Cmd + Y:</strong> Redo last action",
                    "<strong>Rotate Camera:</strong> Hold Left Click & Drag Mouse",
                    "<strong>Zoom In/Out:</strong> Mouse Scroll",
                    "<strong>Pan Camera:</strong> Hold Right Click & Drag Mouse (or Middle Click)"
                ],
                colorNames: { red: 'Red', green: 'Green', blue: 'Blue', yellow: 'Yellow', cyan: 'Cyan', orange: 'Orange', white: 'White', lightGray: 'Light Gray', darkGray: 'Dark Gray', brown: 'Brown'}
            }
        };


        let availableColors = [ 
            { nameKey: 'red', hex: 0xff0000, isCustom: false }, 
            { nameKey: 'green', hex: 0x00cc00, isCustom: false }, 
            { nameKey: 'blue', hex: 0x0000cc, isCustom: false },
            { nameKey: 'yellow', hex: 0xffff33, isCustom: false }, 
            { nameKey: 'cyan', hex: 0x00cccc, isCustom: false }, 
            { nameKey: 'orange', hex: 0xff9900, isCustom: false }, 
            { nameKey: 'white', hex: 0xffffff, isCustom: false }, 
            { nameKey: 'lightGray', hex: 0xcccccc, isCustom: false }, 
            { nameKey: 'darkGray', hex: 0x666666, isCustom: false },
            { nameKey: 'brown', hex: 0x964B00, isCustom: false } 
        ];


        // Use DOMContentLoaded to ensure all HTML elements are available before init() is called
        window.addEventListener('DOMContentLoaded', init);
        
        function init() {
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x1a202c);
            toggleDarkMode();
            updateUITextElements();
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
            camera.position.set(gridSize / 2, gridSize * 0.8, gridSize * 1.5);
            camera.lookAt(gridSize / 2, 0, gridSize / 2);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.getElementById('canvas-container').appendChild(renderer.domElement);

            controls = new OrbitControls(camera, renderer.domElement); 
            controls.target.set(gridSize / 2, 0, gridSize / 2); 
            controls.enableDamping = true; 

            createGridAndPlane(); 

            rollOverMaterial = new THREE.MeshBasicMaterial({ color: currentHexColor, opacity: 0.5, transparent: true });
            rollOverMesh = new THREE.Mesh(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize), rollOverMaterial);
            rollOverMesh.position.y = -1000; 
            scene.add(rollOverMesh);

            cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

            raycaster = new THREE.Raycaster();
            pointer = new THREE.Vector2();

            const ambientLight = new THREE.AmbientLight(0x606060, 1.8); 
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8); 
            directionalLight.position.set(1, 0.75, 0.5).normalize();
            scene.add(directionalLight);

            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerdown', onPointerDown);
            document.addEventListener('pointerup', onPointerUp); 
            document.addEventListener('keydown', onDocumentKeyDown);
            document.addEventListener('keyup', onDocumentKeyUp);
            window.addEventListener('resize', onWindowResize);

            renderer.domElement.addEventListener('contextmenu', function (event) {
                event.preventDefault();
            });

            setupUI();
            updateUITextElements(); 
            animate(); 
        }

        function createGridAndPlane() {
            if (gridHelper) scene.remove(gridHelper);
            if (plane && objects.includes(plane)) {
                scene.remove(plane);
                objects.splice(objects.indexOf(plane), 1);
            }
            
            const gridColor1 = (currentTheme === 'dark') ? 0x4a5568 : 0xcccccc; 
            const gridColor2 = (currentTheme === 'dark') ? 0x374151 : 0xcccccc; 

            gridHelper = new THREE.GridHelper(gridSize, gridDivisions, gridColor1, gridColor2);
            gridHelper.position.set(gridSize / 2 - cubeSize / 2, 0, gridSize / 2 - cubeSize / 2); 
            scene.add(gridHelper);

            const planeGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
            planeGeometry.rotateX(-Math.PI / 2);
            plane = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }));
            plane.position.set(gridSize / 2 - cubeSize / 2, 0, gridSize / 2 - cubeSize / 2);
            scene.add(plane);
            if (!objects.includes(plane)) objects.push(plane); 
        }

        function applyGridChangeLogic(newSize, recordHistory = false, oldSizeForHistory = null) {
            const previousGridSize = gridSize; 

            gridSize = newSize;
            gridDivisions = gridSize / cubeSize;

            createGridAndPlane(); 

            controls.target.set(gridSize / 2, 0, gridSize / 2);
            camera.position.set(gridSize / 2, gridSize * 0.8, gridSize * 1.5); 
            controls.update();

            clearSelection();
            lastPlacedCubePosition = null;

            if (recordHistory) {
                 recordAction('change_grid_size', { oldSize: oldSizeForHistory !== null ? oldSizeForHistory : previousGridSize, newSize: gridSize });
            }
        }


        function recordAction(type, data, clearRedo = true) {
            if (historyStack.length >= MAX_HISTORY_STATES) {
                historyStack.shift(); 
            }
            historyStack.push({ type, data });
            if (clearRedo) {
                redoStack.length = 0; 
            }
        }
        
        function getCubeDataForUndo(cubeObject) {
            if (!cubeObject || cubeObject === plane || cubeObject === rollOverMesh) return null;
            const color = cubeObject.userData.originalMaterial ? parseInt(cubeObject.userData.originalMaterial.color.getHexString(), 16) : parseInt(cubeObject.material.color.getHexString(), 16);
            return { position: cubeObject.position.clone(), color: color, uuid: cubeObject.uuid };
        }


        function undoLastAction() {
            if (historyStack.length === 0) {
                showMessage("msgNoUndo");
                return;
            }
            const actionToUndo = historyStack.pop();
            redoStack.push(actionToUndo); 
            clearSelection(); 

            switch (actionToUndo.type) {
                case 'add_single':
                    const objToUndoAdd = objects.find(o => o.uuid === actionToUndo.data.uuid);
                    if (objToUndoAdd) deleteSingleCube(objToUndoAdd, true); 
                    if (historyStack.length > 0) {
                        const previousAction = historyStack[historyStack.length -1];
                        if (previousAction.type === 'add_single' || previousAction.type === 'add_line') {
                           lastPlacedCubePosition = previousAction.data.uuid ? objects.find(o=>o.uuid === previousAction.data.uuid)?.position.clone() : null;
                           if (!lastPlacedCubePosition && previousAction.type === 'add_line' && previousAction.data.cubesData.length > 0){
                               lastPlacedCubePosition = previousAction.data.cubesData[previousAction.data.cubesData.length-1].position.clone();
                           }
                        } else {
                           lastPlacedCubePosition = null;
                        }
                    } else {
                        lastPlacedCubePosition = null;
                    }
                    break;
                case 'add_line': 
                    actionToUndo.data.cubesData.forEach(objData => {
                        const objToUndoLineAdd = objects.find(o => o.uuid === objData.uuid);
                        if(objToUndoLineAdd) deleteSingleCube(objToUndoLineAdd, true);
                    });
                    lastPlacedCubePosition = actionToUndo.data.previousLastPlaced ? actionToUndo.data.previousLastPlaced.clone() : null;
                    break;
                case 'delete_single':
                case 'delete_multiple_drag': 
                    const itemsToReAdd = Array.isArray(actionToUndo.data) ? actionToUndo.data : [actionToUndo.data];
                    itemsToReAdd.forEach(item => placeSingleCube(item.position, item.color, true));
                    break;
                case 'delete_selected':
                    actionToUndo.data.forEach(item => placeSingleCube(item.position, item.color, true));
                    break;
                case 'move_selected':
                    actionToUndo.data.forEach(move => {
                        const obj = objects.find(o => o.uuid === move.uuid);
                        if (obj) obj.position.copy(move.oldPosition);
                    });
                    break;
                case 'copy_selected':
                     actionToUndo.data.newCubes.forEach(copiedCubeData => { 
                        const objToDel = objects.find(o => o.uuid === copiedCubeData.uuid);
                        if(objToDel) deleteSingleCube(objToDel, true);
                     });
                    actionToUndo.data.originalSelection.forEach(originalObjUUID => {
                        const objToReselect = objects.find(o => o.uuid === originalObjUUID);
                        if (objToReselect && !selectedObjects.includes(objToReselect)) {
                             objToReselect.userData.originalMaterial = objToReselect.material;
                             objToReselect.material = selectedMaterial;
                             selectedObjects.push(objToReselect);
                        }
                    });
                    break;
                case 'change_color':
                    currentHexColor = actionToUndo.data.oldColor;
                    rollOverMaterial.color.setHex(currentHexColor);
                    updateActiveColorButton(currentHexColor);
                    break;
                case 'change_grid_size':
                    applyGridChangeLogic(actionToUndo.data.oldSize, false); 
                    break;
                case 'batch_select_toggle':
                    actionToUndo.data.forEach(change => {
                        const obj = objects.find(o => o.uuid === change.uuid);
                        if (obj) {
                            if (change.oldSelectedState) { 
                                if (!selectedObjects.includes(obj)) {
                                    obj.userData.originalMaterial = obj.material;
                                    obj.material = selectedMaterial;
                                    selectedObjects.push(obj);
                                }
                            } else { 
                                const index = selectedObjects.indexOf(obj);
                                if (index > -1) {
                                    if (obj.userData.originalMaterial) {
                                        obj.material = obj.userData.originalMaterial;
                                        delete obj.userData.originalMaterial;
                                    }
                                    selectedObjects.splice(index, 1);
                                }
                            }
                        }
                    });
                    break;
            }
        }
        
        function redoLastAction() {
            if (redoStack.length === 0) {
                showMessage("msgNoRedo");
                return;
            }
            const actionToRedo = redoStack.pop();
            clearSelection();

            switch (actionToRedo.type) {
                case 'add_single':
                    const newCubeForRedo = placeSingleCube(actionToRedo.data.position, actionToRedo.data.color, true);
                    if (newCubeForRedo) {
                        actionToRedo.data.uuid = newCubeForRedo.uuid; 
                        lastPlacedCubePosition = newCubeForRedo.position.clone();
                    }
                    break;
                case 'add_line':
                    const reCreatedLineCubes = [];
                    actionToRedo.data.cubesData.forEach(cubeData => {
                        const reCreatedCube = placeSingleCube(cubeData.position, cubeData.color, true);
                        if (reCreatedCube) {
                            cubeData.uuid = reCreatedCube.uuid; 
                            reCreatedLineCubes.push(reCreatedCube);
                        }
                    });
                    if (reCreatedLineCubes.length > 0) {
                        lastPlacedCubePosition = reCreatedLineCubes[reCreatedLineCubes.length - 1].position.clone();
                    } else {
                        lastPlacedCubePosition = actionToRedo.data.previousLastPlaced ? actionToRedo.data.previousLastPlaced.clone() : null;
                    }
                    break;
                case 'delete_single':
                case 'delete_multiple_drag':
                    const itemsToReDelete = Array.isArray(actionToRedo.data) ? actionToRedo.data : [actionToRedo.data];
                    itemsToReDelete.forEach(item => {
                        const objToDel = objects.find(o => o.uuid === item.uuid);
                        if (objToDel) deleteSingleCube(objToDel, true);
                    });
                    break;
                case 'delete_selected':
                    actionToRedo.data.forEach(item => {
                        const objToDel = objects.find(o => o.uuid === item.uuid);
                        if (objToDel) deleteSingleCube(objToDel, true);
                    });
                    break;
                case 'move_selected':
                     actionToRedo.data.forEach(move => {
                        const obj = objects.find(o => o.uuid === move.uuid);
                        if (obj) obj.position.copy(move.newPosition); 
                    });
                    break;
                case 'copy_selected':
                    actionToRedo.data.newCubes.forEach(copiedCubeData => { 
                        const newCube = placeSingleCube(copiedCubeData.position, copiedCubeData.color, true, true); // Force placement for redo
                        if (newCube) { // Select the re-created copied cubes
                            newCube.userData.originalMaterial = newCube.material; 
                            newCube.material = selectedMaterial;
                            selectedObjects.push(newCube);
                        }
                    });
                    break;
                case 'change_color':
                    currentHexColor = actionToRedo.data.newColor;
                    rollOverMaterial.color.setHex(currentHexColor);
                    updateActiveColorButton(currentHexColor);
                    break;
                case 'change_grid_size':
                    applyGridChangeLogic(actionToRedo.data.newSize, false); 
                    break;
                case 'batch_select_toggle':
                     actionToRedo.data.forEach(change => {
                        const obj = objects.find(o => o.uuid === change.uuid);
                        if (obj) {
                            if (change.newSelectedState) { 
                                if (!selectedObjects.includes(obj)) {
                                    obj.userData.originalMaterial = obj.material;
                                    obj.material = selectedMaterial;
                                    selectedObjects.push(obj);
                                }
                            } else { 
                                const index = selectedObjects.indexOf(obj);
                                if (index > -1) {
                                    if (obj.userData.originalMaterial) {
                                        obj.material = obj.userData.originalMaterial;
                                        delete obj.userData.originalMaterial;
                                    }
                                    selectedObjects.splice(index, 1);
                                }
                            }
                        }
                    });
                    break;
            }
            recordAction(actionToRedo.type, actionToRedo.data, false); 
        }


        function updateActiveColorButton(hexColor) {
            document.querySelectorAll('.color-button').forEach(btn => {
                let btnColorHex = btn.style.backgroundColor;
                if (btnColorHex.startsWith('rgb')) { 
                    const rgb = btnColorHex.match(/\d+/g).map(Number);
                    btnColorHex = ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
                } else if (btnColorHex.startsWith('#')) {
                    btnColorHex = btnColorHex.substring(1);
                }
                
                if (parseInt(btnColorHex, 16) === hexColor) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        
        function updateUITextElements() {
            const lang = uiStrings[currentLanguage];
            const colorNames = lang.colorNames || {};

            document.documentElement.lang = currentLanguage;
            document.body.style.direction = currentLanguage === 'fa' ? 'rtl' : 'ltr';

            const controlsDiv = document.getElementById('controls'); 
            const instructionsDiv = document.getElementById('instructions');
            const addCustomColorBtn = document.getElementById('add-custom-color-button');
            const gridSizeInput = document.getElementById('grid-size-input');
            const controlsToggle = document.getElementById('controls-toggle'); 
            const instructionsToggle = document.getElementById('instructions-toggle');
            
            controlsDiv.style.removeProperty('left');
            controlsDiv.style.removeProperty('right');
            instructionsDiv.style.removeProperty('left');
            instructionsDiv.style.removeProperty('right');


            if (currentLanguage === 'fa') {
                controlsDiv.style.left = '10px';
                instructionsDiv.style.right = '10px'; 
                instructionsDiv.style.textAlign = 'right';
                instructionsToggle.style.marginLeft = '8px';
                instructionsToggle.style.marginRight = 'auto';
                if(controlsToggle) { 
                    controlsToggle.style.marginLeft = '8px'; 
                    controlsToggle.style.marginRight = 'auto';
                }
                addCustomColorBtn.style.marginRight = '8px'; 
                addCustomColorBtn.style.marginLeft = 'auto';
                gridSizeInput.style.marginLeft = '8px'; 
                gridSizeInput.style.marginRight = 'auto';
                document.querySelectorAll('.remove-color-button').forEach(btn => { 
                    btn.style.left = '-5px'; 
                    btn.style.right = 'auto';
                });

            } else { // English
                controlsDiv.style.right = '10px';
                instructionsDiv.style.left = '10px'; 
                instructionsDiv.style.textAlign = 'left';
                instructionsToggle.style.marginRight = '8px';
                instructionsToggle.style.marginLeft = 'auto';
                if(controlsToggle) { 
                    controlsToggle.style.marginRight = '8px'; 
                    controlsToggle.style.marginLeft = 'auto';
                }
                addCustomColorBtn.style.marginLeft = '8px'; 
                addCustomColorBtn.style.marginRight = 'auto';
                gridSizeInput.style.marginRight = '8px'; 
                gridSizeInput.style.marginLeft = 'auto';
                 document.querySelectorAll('.remove-color-button').forEach(btn => { 
                    btn.style.right = '-5px'; 
                    btn.style.left = 'auto';
                });
            }

            const darkModeButton = document.getElementById('dark-mode-toggle-button');
            if (currentTheme === 'light') {
                darkModeButton.textContent = lang.darkModeToggleLight;
            } else {
                darkModeButton.textContent = lang.darkModeToggleDark;
            }


            document.getElementById('language-toggle-button').textContent = lang.languageToggle;
            if(document.getElementById('controls-main-title')) document.getElementById('controls-main-title').textContent = lang.controlsMainTitle; 
            document.getElementById('controls-title-colors').textContent = lang.controlsTitleColors;
            document.getElementById('default-colors-title').textContent = lang.defaultColorsTitle;
            document.getElementById('custom-colors-title').textContent = lang.customColorsTitle;
            addCustomColorBtn.textContent = lang.addCustomColor;
            document.getElementById('grid-size-title').textContent = lang.gridSizeTitle;
            document.getElementById('apply-grid-size-button').textContent = lang.applyGridSize;
            document.getElementById('operations-title').textContent = lang.operationsTitle;
            document.getElementById('copy-selected-button').textContent = lang.copySelected;
            document.getElementById('delete-selected-button').textContent = lang.deleteSelected;
            document.getElementById('undo-button').textContent = lang.undo;
            document.getElementById('redo-button').textContent = lang.redo;
            document.getElementById('clear-all-button').textContent = lang.clearAll;
            document.getElementById('import-export-title').textContent = lang.importExportTitle;
            document.getElementById('export-obj-button').textContent = lang.exportOBJ;
            document.getElementById('export-json-button').textContent = lang.exportJSON;
            document.getElementById('import-json-button').textContent = lang.importJSON;
            document.getElementById('instructions-main-title').textContent = lang.instructionsTitle;
            document.getElementById('message-ok-button').textContent = lang.msgOk;
            
            const controlsContentDiv = document.getElementById('controls-content'); 
            if(controlsToggle && controlsContentDiv) controlsToggle.textContent = controlsContentDiv.classList.contains('collapsed') ? '▸' : '▾';
            const instructionsContentDiv = document.getElementById('instructions-content');
            if(instructionsToggle && instructionsContentDiv) instructionsToggle.textContent = instructionsContentDiv.classList.contains('collapsed') ? '▸' : '▾';


            instructionsContentDiv.innerHTML = ''; 
            lang.instructionsList.forEach(line => {
                const p = document.createElement('p');
                p.innerHTML = line;
                instructionsContentDiv.appendChild(p);
            });
            renderColorPalette(); 
        }

        function toggleDarkMode() {
            currentTheme = (currentTheme === 'light') ? 'dark' : 'light';
            document.body.classList.toggle('dark-mode', currentTheme === 'dark');
            
            if (currentTheme === 'dark') {
                scene.background = new THREE.Color(0x1a202c); 
            } else {
                scene.background = new THREE.Color(0xf0f0f0); 
            }
            createGridAndPlane(); 
            updateUITextElements(); 
        }


        function renderColorPalette() {
            const defaultPaletteContainer = document.getElementById('default-color-palette');
            const customPaletteContainer = document.getElementById('custom-color-palette');
            defaultPaletteContainer.innerHTML = ''; 
            customPaletteContainer.innerHTML = ''; 
            const langColorNames = uiStrings[currentLanguage].colorNames || {};
            const customColorNamePrefix = uiStrings[currentLanguage].customColorNamePrefix || "Custom";
            const removeColorTitle = uiStrings[currentLanguage].removeColorTitle || "Remove this color";


            availableColors.forEach((colorInfo) => {
                const button = document.createElement('button');
                button.classList.add('color-button');
                button.style.backgroundColor = '#' + Number(colorInfo.hex).toString(16).padStart(6, '0');
                button.title = colorInfo.isCustom ? `${customColorNamePrefix} (#${Number(colorInfo.hex).toString(16).padStart(6, '0').toUpperCase()})` : (langColorNames[colorInfo.nameKey] || colorInfo.nameKey);
                
                button.addEventListener('click', () => {
                    const oldColor = currentHexColor;
                    currentHexColor = colorInfo.hex;
                    rollOverMaterial.color.setHex(currentHexColor);
                    updateActiveColorButton(currentHexColor);
                    if (oldColor !== currentHexColor) { 
                        recordAction('change_color', { oldColor: oldColor, newColor: currentHexColor });
                    }
                });
                if (colorInfo.hex === currentHexColor) {
                    button.classList.add('active');
                }

                if (colorInfo.isCustom) {
                    const wrapper = document.createElement('div');
                    wrapper.classList.add('custom-color-item-wrapper'); 
                    
                    wrapper.appendChild(button);

                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = '×';
                    removeBtn.classList.add('remove-color-button'); 
                    removeBtn.title = removeColorTitle;
                    if (currentLanguage === 'en') { 
                        removeBtn.style.left = 'auto';
                        removeBtn.style.right = '-5px'; 
                    } else {
                        removeBtn.style.left = '-5px'; 
                        removeBtn.style.right = 'auto';
                    }

                    removeBtn.addEventListener('click', (e) => {
                        e.stopPropagation(); 
                        availableColors = availableColors.filter(c => c.hex !== colorInfo.hex);
                        if (currentHexColor === colorInfo.hex) { 
                            currentHexColor = availableColors.length > 0 ? availableColors[0].hex : 0xff0000; 
                            rollOverMaterial.color.setHex(currentHexColor);
                        }
                        renderColorPalette(); 
                        updateActiveColorButton(currentHexColor);
                    });
                    wrapper.appendChild(removeBtn);
                    customPaletteContainer.appendChild(wrapper);
                } else {
                    const wrapper = document.createElement('div'); 
                    wrapper.classList.add('flex', 'justify-center', 'items-center'); 
                    wrapper.appendChild(button);
                    defaultPaletteContainer.appendChild(wrapper);
                }
            });
        }


        function setupUI() {
            const langButton = document.getElementById('language-toggle-button');
            langButton.addEventListener('click', () => {
                currentLanguage = currentLanguage === 'fa' ? 'en' : 'fa';
                updateUITextElements();
            });

            const darkModeButton = document.getElementById('dark-mode-toggle-button');
            darkModeButton.addEventListener('click', toggleDarkMode);
            
            renderColorPalette(); 

            document.getElementById('add-custom-color-button').addEventListener('click', () => {
                const colorPicker = document.getElementById('custom-color-input');
                const newColorHexStr = colorPicker.value.substring(1); 
                const newColorInt = parseInt(newColorHexStr, 16);

                if (isNaN(newColorInt)) {
                    showMessage("msgInvalidColorCode", false, true); 
                    return;
                }
                if (availableColors.some(c => c.hex === newColorInt)) {
                    showMessage("msgColorExists", false, true); 
                    return;
                }
                const customPrefix = uiStrings[currentLanguage].customColorNamePrefix || "Custom";
                availableColors.push({name: `${customPrefix} (${newColorHexStr.toUpperCase()})`, hex: newColorInt, isCustom: true });
                renderColorPalette();
                currentHexColor = newColorInt;
                rollOverMaterial.color.setHex(currentHexColor);
                updateActiveColorButton(currentHexColor);
            });


            document.getElementById('undo-button').addEventListener('click', undoLastAction);
            document.getElementById('redo-button').addEventListener('click', redoLastAction); 
            document.getElementById('copy-selected-button').addEventListener('click', copySelectedCubes);
            document.getElementById('delete-selected-button').addEventListener('click', deleteSelectedCubes);

            const gridSizeInput = document.getElementById('grid-size-input');
            gridSizeInput.value = gridSize; 
            document.getElementById('apply-grid-size-button').addEventListener('click', () => {
                const newSizeInput = parseInt(gridSizeInput.value);
                if (isNaN(newSizeInput) || newSizeInput < 10 || newSizeInput > 50) {
                    showMessage("msgInvalidGridSize");
                    gridSizeInput.value = gridSize; 
                    return;
                }

                const minY = -(newSizeInput - cubeSize / 2);
                const maxY = newSizeInput - cubeSize / 2;
                const minXZ = cubeSize / 2;
                const maxXZ = newSizeInput - cubeSize / 2;

                for (const obj of objects) {
                    if (obj !== plane) {
                        if (obj.position.x < minXZ || obj.position.x > maxXZ ||
                            obj.position.y < minY || obj.position.y > maxY || 
                            obj.position.z < minXZ || obj.position.z > maxXZ) {
                            showMessage("msgGridSizeConflict");
                            gridSizeInput.value = gridSize; 
                            return;
                        }
                    }
                }
                applyGridChangeLogic(newSizeInput, true, gridSize); 
            });


            const clearAllButton = document.getElementById('clear-all-button');
            clearAllButton.addEventListener('click', () => {
                if (objects.length <= 1 && selectedObjects.length === 0) { 
                    showMessage("msgNothingToClear");
                    return;
                }
                showConfirmation("msgConfirmClearAll", () => {
                    clearSelection(); 
                    lastPlacedCubePosition = null;
                    while (objects.length > 1) {
                        const object = objects.pop(); 
                        if (object !== plane) { 
                            scene.remove(object);
                            if (object.geometry) object.geometry.dispose();
                            if (object.material && object.material !== selectedMaterial) { 
                                if (Array.isArray(object.material)) {
                                    object.material.forEach(m => { if (m !== selectedMaterial) m.dispose();});
                                } else {
                                   object.material.dispose();
                                }
                            }
                        } else {
                           objects.push(plane); 
                           break; 
                        }
                    }
                    if (!objects.includes(plane)) { 
                        objects.length = 0; 
                        objects.push(plane); 
                    } else if (objects.length > 1) { 
                         objects.splice(0, objects.length, plane);
                    }
                    historyStack.length = 0; 
                    redoStack.length = 0; 
                });
            });
            document.getElementById('message-ok-button').addEventListener('click', () => {
                hideMessage();
            });


            const instructionsHeader = document.getElementById('instructions-header');
            const instructionsContentDiv = document.getElementById('instructions-content');
            const instructionsToggle = document.getElementById('instructions-toggle');
            instructionsHeader.addEventListener('click', () => {
                instructionsContentDiv.classList.toggle('collapsed');
                instructionsToggle.textContent = instructionsContentDiv.classList.contains('collapsed') ? '▸' : '▾'; 
            });

            const controlsHeader = document.getElementById('controls-header');
            const controlsContentDiv = document.getElementById('controls-content');
            const controlsToggle = document.getElementById('controls-toggle');
            if (controlsHeader && controlsContentDiv && controlsToggle) { 
                controlsHeader.addEventListener('click', (event) => {
                    if (event.target === controlsHeader || controlsHeader.querySelector('h3').contains(event.target) || event.target === controlsToggle) {
                        controlsContentDiv.classList.toggle('collapsed');
                        controlsToggle.textContent = controlsContentDiv.classList.contains('collapsed') ? '▸' : '▾'; 
                    }
                });
            }


            // Import/Export Buttons
            document.getElementById('export-obj-button').addEventListener('click', exportToOBJ);
            document.getElementById('export-json-button').addEventListener('click', exportToJSON);
            document.getElementById('import-json-button').addEventListener('click', () => {
                document.getElementById('import-json-input').click();
            });
            document.getElementById('import-json-input').addEventListener('change', importFromJSON);
        }

        function showMessage(textKey, selectionRelated = false, preventCubePlacement = false) { 
            const messageBox = document.getElementById('message-box');
            const messageText = document.getElementById('message-text');
            const okButton = document.getElementById('message-ok-button');
            
            messageText.textContent = uiStrings[currentLanguage][textKey] || textKey; 
            okButton.textContent = uiStrings[currentLanguage].msgOk;
            selectionShouldBePreservedAfterMessage = selectionRelated; 
            preventCubePlacementAfterMessage = preventCubePlacement; 
            
            const existingConfirmButtons = messageBox.querySelectorAll('.confirm-btn');
            existingConfirmButtons.forEach(btn => btn.remove());
            okButton.style.display = 'inline-block'; 

            messageBox.style.display = 'block';
        }

        function hideMessage() {
            document.getElementById('message-box').style.display = 'none';
        }

        function showConfirmation(textKey, onConfirm) {
            const messageBox = document.getElementById('message-box');
            const messageText = document.getElementById('message-text');
            const okButton = document.getElementById('message-ok-button');

            messageText.innerHTML = uiStrings[currentLanguage][textKey] || textKey; 

            const existingButtons = messageBox.querySelectorAll('.confirm-btn');
            existingButtons.forEach(btn => btn.remove());

            const confirmButton = document.createElement('button');
            confirmButton.textContent = uiStrings[currentLanguage].msgConfirmYes;
            confirmButton.classList.add('confirm-btn'); 
            confirmButton.style.cssText = 'background-color: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin-top: 15px; margin-right: 5px;';

            const cancelButton = document.createElement('button');
            cancelButton.textContent = uiStrings[currentLanguage].msgConfirmNo;
            cancelButton.classList.add('confirm-btn'); 
            cancelButton.style.cssText = 'background-color: #f44336; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin-top: 15px;';
            
            confirmButton.onclick = () => { hideMessage(); onConfirm(); };
            cancelButton.onclick = () => { hideMessage(); };
            
            okButton.style.display = 'none'; 
            messageBox.appendChild(confirmButton);
            messageBox.appendChild(cancelButton);
            messageBox.style.display = 'block';
        }

        function clearSelection() {
            selectedObjects.forEach(obj => {
                if (obj.userData.originalMaterial) {
                    obj.material = obj.userData.originalMaterial;
                    delete obj.userData.originalMaterial;
                }
            });
            selectedObjects = [];
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function onPointerMove(event) {
            const currentPointerScreenCoords = new THREE.Vector2(event.clientX, event.clientY);
            if (isPotentialSimpleClick) {
                if (pointerDownScreenCoords.distanceToSquared(currentPointerScreenCoords) > DRAG_THRESHOLD_SQ) {
                    isPotentialSimpleClick = false; 
                    potentialSimpleClickPlacementPosition = null; 
                }
            }
            
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(objects, false); 

            if (intersects.length > 0) {
                const intersect = intersects[0];
                const voxelPosition = new THREE.Vector3();
                const tempHoverPos = new THREE.Vector3().copy(intersect.point);
                tempHoverPos.add(intersect.face.normal.clone().multiplyScalar(0.01)); 
                voxelPosition.x = Math.floor(tempHoverPos.x / cubeSize) * cubeSize + cubeSize / 2;
                voxelPosition.y = Math.floor(tempHoverPos.y / cubeSize) * cubeSize + cubeSize / 2;
                voxelPosition.z = Math.floor(tempHoverPos.z / cubeSize) * cubeSize + cubeSize / 2;
                rollOverMesh.position.copy(voxelPosition);

                if (isShiftDown && isRightMouseDown) { 
                    if (intersect.object !== plane && intersect.object !== rollOverMesh) {
                        const alreadyMarkedForDelete = currentDragDeleteData.find(d => d.uuid === intersect.object.uuid);
                        if (!alreadyMarkedForDelete) {
                            const deletedData = getCubeDataForUndo(intersect.object);
                            if (deletedData) currentDragDeleteData.push(deletedData);
                            deleteSingleCube(intersect.object, true); 
                        }
                    }
                } else if (isAltDown && isAltLeftMouseDown) { 
                     if (intersect.object !== plane && intersect.object !== rollOverMesh) {
                        const hoveredCube = intersect.object;
                        if (!dragProcessedCubes.has(hoveredCube.uuid)) {
                            const index = selectedObjects.indexOf(hoveredCube);
                            if (index > -1) { 
                                if (hoveredCube.userData.originalMaterial) {
                                    hoveredCube.material = hoveredCube.userData.originalMaterial;
                                    delete hoveredCube.userData.originalMaterial;
                                }
                                selectedObjects.splice(index, 1);
                            } else { 
                                hoveredCube.userData.originalMaterial = hoveredCube.material;
                                hoveredCube.material = selectedMaterial;
                                selectedObjects.push(hoveredCube);
                            }
                            dragProcessedCubes.add(hoveredCube.uuid);
                        }
                    }
                }
            }
        }
        
        function deleteSingleCube(objectToDelete, silent = false) { 
            if (objectToDelete && objectToDelete !== plane) {
                const objIndex = objects.indexOf(objectToDelete);
                if (objIndex > -1) objects.splice(objIndex, 1);

                const selIndex = selectedObjects.indexOf(objectToDelete);
                if (selIndex > -1) {
                    selectedObjects.splice(selIndex, 1);
                }
                
                const cubeDataForHistory = getCubeDataForUndo(objectToDelete);

                scene.remove(objectToDelete);
                if (objectToDelete.geometry) objectToDelete.geometry.dispose();
                
                if (objectToDelete.userData.originalMaterial) {
                    objectToDelete.userData.originalMaterial.dispose();
                    delete objectToDelete.userData.originalMaterial;
                } else if (objectToDelete.material && objectToDelete.material !== selectedMaterial) {
                     objectToDelete.material.dispose();
                }

                if (lastPlacedCubePosition && lastPlacedCubePosition.equals(objectToDelete.position)) {
                    lastPlacedCubePosition = null;
                }

                if (!silent && cubeDataForHistory) {
                     recordAction('delete_single', cubeDataForHistory);
                }
                return cubeDataForHistory; 
            }
            return null;
        }
        
        function onPointerUp(event) {
            if (event.button === 0) { // Left mouse button up
                if (isAltLeftMouseDown) {
                    isAltLeftMouseDown = false;
                    dragProcessedCubes.clear();
                    if (controls) controls.enabled = true;
                    recordAction('selection_change', null); 
                } else if (isPotentialSimpleClick && potentialSimpleClickPlacementPosition) {
                     // This was a simple click, not a drag for camera rotation
                    const cube = placeSingleCube(potentialSimpleClickPlacementPosition, currentHexColor);
                    if (cube) {
                        recordAction('add_single', { uuid: cube.uuid, position: cube.position.clone(), color: parseInt(cube.material.color.getHexString(), 16) });
                        lastPlacedCubePosition = cube.position.clone();
                    }
                }
                isPotentialSimpleClick = false;
                potentialSimpleClickPlacementPosition = null;
            } else if (event.button === 2) { // Right mouse button released
                if (isShiftDown && currentDragDeleteData.length > 0) {
                    recordAction('delete_multiple_drag', [...currentDragDeleteData]);
                }
                isRightMouseDown = false;
                currentDragDeleteData = [];
                if (controls) controls.enabled = true; 
            }
        }


        function onPointerDown(event) {
            const instructionsDiv = document.getElementById('instructions');
            const controlsDiv = document.getElementById('controls'); 
            const messageBoxDiv = document.getElementById('message-box');

            if (instructionsDiv.contains(event.target) || 
                controlsDiv.contains(event.target) ||
                (messageBoxDiv && messageBoxDiv.style.display === 'block' && messageBoxDiv.contains(event.target))
            ) {
                return; 
            }
            if (preventCubePlacementAfterMessage) {
                preventCubePlacementAfterMessage = false;
                return; 
            }

            pointerDownScreenCoords.set(event.clientX, event.clientY); 
            isPotentialSimpleClick = false; 
            potentialSimpleClickPlacementPosition = null; 


            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(objects, false); 

            if (intersects.length > 0) {
                const intersect = intersects[0];
                const targetPlacementPosition = rollOverMesh.position.clone();

                if (event.button === 2 ) { 
                    isRightMouseDown = true; 
                    if (isShiftDown) {
                        if(controls) controls.enabled = false; 
                        currentDragDeleteData = []; 
                        if (intersect.object !== plane && intersect.object !== rollOverMesh) {
                            const deletedData = getCubeDataForUndo(intersect.object);
                            if (deletedData) currentDragDeleteData.push(deletedData);
                            deleteSingleCube(intersect.object, true); 
                        }
                    } else { 
                        if (intersect.object !== plane && intersect.object !== rollOverMesh) { 
                            deleteSingleCube(intersect.object); 
                        }
                    }
                } else if (event.button === 0) { 
                    if (isAltDown) { 
                        isAltLeftMouseDown = true;
                        dragProcessedCubes.clear();
                        if(controls) controls.enabled = false;

                        if (intersect.object !== plane && intersect.object !== rollOverMesh) {
                            const clickedObject = intersect.object;
                            const index = selectedObjects.indexOf(clickedObject);
                            if (index > -1) { 
                                if (clickedObject.userData.originalMaterial) {
                                    clickedObject.material = clickedObject.userData.originalMaterial;
                                    delete clickedObject.userData.originalMaterial;
                                }
                                selectedObjects.splice(index, 1);
                            } else { 
                                clickedObject.userData.originalMaterial = clickedObject.material; 
                                clickedObject.material = selectedMaterial;
                                selectedObjects.push(clickedObject);
                            }
                            dragProcessedCubes.add(clickedObject.uuid);
                        }
                        lastPlacedCubePosition = null; 
                    } else if (isShiftDown) { 
                        if (selectionShouldBePreservedAfterMessage) {
                            selectionShouldBePreservedAfterMessage = false;
                        } else if (selectedObjects.length > 0) {
                             clearSelection(); 
                             lastPlacedCubePosition = null;
                        }
                        
                        if (lastPlacedCubePosition) { 
                            const startPoint = lastPlacedCubePosition.clone();
                            const addedLineCubesData = []; 
                            if (startPoint.distanceToSquared(targetPlacementPosition) < 0.001) { 
                                const cube = placeSingleCube(targetPlacementPosition, currentHexColor); 
                                if (cube) addedLineCubesData.push({uuid: cube.uuid, position: cube.position.clone(), color: parseInt(cube.material.color.getHexString(), 16)});
                            } else {
                                const direction = new THREE.Vector3().subVectors(targetPlacementPosition, startPoint);
                                const distance = direction.length();
                                const numSteps = Math.max(1, Math.round(distance / cubeSize)); 

                                for (let i = 0; i <= numSteps; i++) {
                                    let t = (numSteps === 0) ? 0 : i / numSteps;
                                    const intermediatePoint = new THREE.Vector3().lerpVectors(startPoint, targetPlacementPosition, t);
                                    
                                    const currentVoxelPosition = new THREE.Vector3(
                                        Math.floor(intermediatePoint.x / cubeSize) * cubeSize + cubeSize / 2,
                                        Math.floor(intermediatePoint.y / cubeSize) * cubeSize + cubeSize / 2,
                                        Math.floor(intermediatePoint.z / cubeSize) * cubeSize + cubeSize / 2
                                    );
                                    const cube = placeSingleCube(currentVoxelPosition, currentHexColor, true); 
                                    if (cube) addedLineCubesData.push({uuid: cube.uuid, position: cube.position.clone(), color: parseInt(cube.material.color.getHexString(), 16)});
                                }
                            }
                            if (addedLineCubesData.length > 0) {
                                recordAction('add_line', { cubesData: addedLineCubesData, previousLastPlaced: startPoint });
                                lastPlacedCubePosition = addedLineCubesData[addedLineCubesData.length - 1].position.clone();
                            }
                        } else { 
                            const cube = placeSingleCube(targetPlacementPosition, currentHexColor);
                            if (cube) {
                                recordAction('add_single', { uuid: cube.uuid, position: cube.position.clone(), color: parseInt(cube.material.color.getHexString(), 16) });
                                lastPlacedCubePosition = cube.position.clone();
                            }
                        }
                    } else { 
                        isPotentialSimpleClick = true; 
                        potentialSimpleClickPlacementPosition = targetPlacementPosition.clone(); 

                        if (selectionShouldBePreservedAfterMessage) {
                            selectionShouldBePreservedAfterMessage = false; 
                        } else if (selectedObjects.length > 0) {
                            clearSelection(); 
                            lastPlacedCubePosition = null;
                        }
                    }
                }
            }
        }
        
        function placeSingleCube(position, hexColor = currentHexColor, isUndoOrRedoOrSilentLine = false, forcePlacement = false) { // Added forcePlacement
            const voxelMaterial = new THREE.MeshLambertMaterial({ color: hexColor });
            const voxel = new THREE.Mesh(cubeGeo, voxelMaterial);
            voxel.position.copy(position);

            let canPlace = true;
            if (!forcePlacement) { // Only check for collision if not forcing placement
                const epsilonSq = (cubeSize * 0.01) * (cubeSize * 0.01); 
                for (let i = 0; i < objects.length; i++) {
                    if (objects[i] !== plane && objects[i].position.distanceToSquared(voxel.position) < epsilonSq) {
                        canPlace = false;
                        break;
                    }
                }
            }

            if (canPlace) {
                scene.add(voxel);
                objects.push(voxel);
                return voxel;
            } else {
                voxelMaterial.dispose(); 
                if (!isUndoOrRedoOrSilentLine) { 
                    showMessage("msgCantPlaceCube");
                }
                return null;
            }
        }
        
        function moveSelection(delta) {
            if (selectedObjects.length === 0) return;

            const originalPositionsData = selectedObjects.map(obj => ({ uuid: obj.uuid, oldPosition: obj.position.clone() }));
            const proposedPositions = new Map();
            let canMoveAll = true;

            const minYBound = -(gridSize - cubeSize/2) - 0.01; 
            const maxYBound =   (gridSize - cubeSize/2) + 0.01;
            const minXZBound = cubeSize/2 - 0.01;
            const maxXZBound = gridSize - cubeSize/2 + 0.01;


            for (const selectedObj of selectedObjects) {
                const newPos = selectedObj.position.clone().add(delta);
                
                if (newPos.x < minXZBound || newPos.x > maxXZBound ||
                    newPos.y < minYBound || newPos.y > maxYBound || 
                    newPos.z < minXZBound || newPos.z > maxXZBound) {
                    canMoveAll = false;
                    break;
                }
                
                proposedPositions.set(selectedObj, newPos);
            }

            if (canMoveAll) {
                const finalMoveData = [];
                selectedObjects.forEach(selectedObj => {
                    const newPosition = proposedPositions.get(selectedObj);
                    const oldPosData = originalPositionsData.find(op => op.uuid === selectedObj.uuid);
                    selectedObj.position.copy(newPosition);
                    finalMoveData.push({uuid: selectedObj.uuid, oldPosition: oldPosData.oldPosition, newPosition: newPosition.clone()});
                });
                recordAction('move_selected', finalMoveData);

            } else {
                showMessage("msgMoveFailedOutOfBounds", true); 
                selectionShouldBePreservedAfterMessage = true;
            }
        }

        function copySelectedCubes() {
            if (selectedObjects.length === 0) {
                showMessage("msgNothingToCopy");
                return;
            }

            const offset = new THREE.Vector3(cubeSize, cubeSize, 0); 
            const newCubesForHistory = []; 
            const newSelectedCubes = []; 

            let isAnyCubeOutOfBounds = false; 

            for (const selectedObj of selectedObjects) {
                const newPos = selectedObj.position.clone().add(offset);
                
                const minYBound = -(gridSize - cubeSize/2) - 0.01; 
                const maxYBound =   (gridSize - cubeSize/2) + 0.01;
                const minXZBound = cubeSize/2 - 0.01;
                const maxXZBound = gridSize - cubeSize/2 + 0.01;

                if (newPos.x < minXZBound || newPos.x > maxXZBound ||
                    newPos.y < minYBound || newPos.y > maxYBound ||
                    newPos.z < minXZBound || newPos.z > maxXZBound) {
                    isAnyCubeOutOfBounds = true;
                    break; 
                }
            }

            if (isAnyCubeOutOfBounds) {
                showMessage("msgCopyFailedOutOfBounds", true); 
                selectionShouldBePreservedAfterMessage = true;
                return;
            }
            
            // If all new positions are within bounds, proceed to copy
            const originalSelectionUUIDs = selectedObjects.map(obj => obj.uuid);
            // Deselect originals before creating copies to avoid issues if originals are part of `objects`
            clearSelection(); 

            originalSelectionUUIDs.forEach(uuid => {
                const originalObj = objects.find(o => o.uuid === uuid); // Find the original object again
                if (originalObj) {
                    const newPos = originalObj.position.clone().add(offset);
                    const originalMaterialColor = (originalObj.userData.originalMaterial || originalObj.material).color.getHex();
                    // Force placement, ignoring collision with existing non-selected cubes
                    const newCube = placeSingleCube(newPos, originalMaterialColor, true, true); 
                    if (newCube) {
                        newCubesForHistory.push({uuid: newCube.uuid, position: newCube.position.clone(), color: newCube.material.color.getHex()}); 
                        newCube.userData.originalMaterial = newCube.material; 
                        newCube.material = selectedMaterial;
                        newSelectedCubes.push(newCube);
                    }
                }
            });
            selectedObjects = newSelectedCubes; // Now select the new cubes

            if (newCubesForHistory.length > 0) {
                recordAction('copy_selected', { newCubes: newCubesForHistory, originalSelection: originalSelectionUUIDs });
            }
        }

        function deleteSelectedCubes() {
            if (selectedObjects.length === 0) {
                showMessage("msgNothingToDelete");
                return;
            }
            const deletedCubesData = [];
            [...selectedObjects].forEach(obj => { 
                 deletedCubesData.push(getCubeDataForUndo(obj));
                 deleteSingleCube(obj, true); 
            });
            if(deletedCubesData.filter(d => d).length > 0) { 
                recordAction('delete_selected', deletedCubesData.filter(d => d));
            }
            clearSelection(); 
        }


        function onDocumentKeyDown(event) {
            const messageBox = document.getElementById('message-box');
            const okButton = document.getElementById('message-ok-button');
            const isMessageBoxVisible = messageBox.style.display === 'block';
            const isSingleOptionMessage = okButton.style.display !== 'none' && !messageBox.querySelector('.confirm-btn');

            if (isMessageBoxVisible && event.keyCode === 13 && isSingleOptionMessage) { 
                event.preventDefault();
                hideMessage(); 
                return;
            }
            
            if (isMessageBoxVisible && event.keyCode !== 27) { 
                 return;
            }


            switch (event.keyCode) {
                case 13: // Enter key
                    if (!isMessageBoxVisible) { 
                        clearSelection();
                        lastPlacedCubePosition = null;
                        selectionShouldBePreservedAfterMessage = false; 
                        preventCubePlacementAfterMessage = false;
                    }
                    break;
                case 16: isShiftDown = true; break; 
                case 18: isAltDown = true; event.preventDefault(); break; 
                case 27: // Escape
                    if (isMessageBoxVisible) {
                        hideMessage(); 
                    } else {
                        clearSelection();
                        lastPlacedCubePosition = null; 
                        selectionShouldBePreservedAfterMessage = false; 
                        preventCubePlacementAfterMessage = false;
                    }
                    break;
                case 37: moveSelection(new THREE.Vector3(-cubeSize, 0, 0)); break; 
                case 39: moveSelection(new THREE.Vector3(cubeSize, 0, 0)); break;  
                case 38: moveSelection(new THREE.Vector3(0, 0, -cubeSize)); break; 
                case 40: moveSelection(new THREE.Vector3(0, 0, cubeSize)); break;  
                case 33: moveSelection(new THREE.Vector3(0, cubeSize, 0)); break;  
                case 34: moveSelection(new THREE.Vector3(0, -cubeSize, 0)); break; 
                case 90: // Z key
                    if (event.ctrlKey || event.metaKey) { 
                        event.preventDefault(); 
                        undoLastAction();
                    }
                    break;
                case 89: // Y key
                    if (event.ctrlKey || event.metaKey) { 
                        event.preventDefault();
                        redoLastAction();
                    }
                    break;
            }
        }

        function onDocumentKeyUp(event) {
            switch (event.keyCode) {
                case 16: 
                    isShiftDown = false; 
                    if(isRightMouseDown) { 
                        if (controls) controls.enabled = true;
                        if (currentDragDeleteData.length > 0) {
                             recordAction('delete_multiple_drag', [...currentDragDeleteData]);
                        }
                        isRightMouseDown = false; 
                        currentDragDeleteData = [];
                    }
                    break; 
                case 18: 
                    isAltDown = false;
                    if (isAltLeftMouseDown) { 
                        isAltLeftMouseDown = false;
                        dragProcessedCubes.clear();
                        if (controls) controls.enabled = true;
                        recordAction('selection_change', null); 
                    }
                    break; 
            }
        }

        function exportToOBJ() {
            let objContent = "# Voxel Builder Export\n";
            let mtlContent = "# Voxel Builder Materials\n";
            let vertexOffset = 1;
            const materials = new Map();
            let materialIndex = 0;

            objects.forEach(obj => {
                if (obj !== plane && obj.geometry && obj.material) {
                    const color = obj.material.color.getHexString();
                    let materialName = `mat_${color}`;
                    if (!materials.has(color)) {
                        materials.set(color, materialName);
                        mtlContent += `newmtl ${materialName}\n`;
                        mtlContent += `Kd ${obj.material.color.r.toFixed(4)} ${obj.material.color.g.toFixed(4)} ${obj.material.color.b.toFixed(4)}\n`;
                        mtlContent += `Ka 0.0000 0.0000 0.0000\n`; 
                        mtlContent += `Ks 0.5000 0.5000 0.5000\n`; 
                        mtlContent += `Ns 10.0000\n`; 
                        mtlContent += `illum 2\n\n`; 
                    } else {
                        materialName = materials.get(color);
                    }

                    const vertices = obj.geometry.attributes.position.array;
                    const matrix = obj.matrixWorld;
                    const tempVertex = new THREE.Vector3();

                    objContent += `o cube_${obj.uuid}\n`;
                    for (let i = 0; i < vertices.length; i += 3) {
                        tempVertex.set(vertices[i], vertices[i+1], vertices[i+2]).applyMatrix4(matrix);
                        objContent += `v ${tempVertex.x.toFixed(4)} ${tempVertex.y.toFixed(4)} ${tempVertex.z.toFixed(4)}\n`;
                    }
                    
                    objContent += `usemtl ${materialName}\n`;
                    objContent += `s off\n`; 

                    const indices = obj.geometry.index ? obj.geometry.index.array : null;
                    if (indices) { 
                        for (let i = 0; i < indices.length; i += 3) {
                            objContent += `f ${indices[i] + vertexOffset} ${indices[i+1] + vertexOffset} ${indices[i+2] + vertexOffset}\n`;
                        }
                    } else { 
                         for (let i = 0; i < vertices.length / 3; i += 3) { 
                            objContent += `f ${i + 1 + vertexOffset -1} ${i + 2 + vertexOffset -1} ${i + 3 + vertexOffset -1}\n`;
                        }
                    }
                    vertexOffset += vertices.length / 3;
                }
            });
            
            downloadFile(objContent, 'voxel_model.obj', 'text/plain');
            downloadFile(mtlContent, 'voxel_model.mtl', 'text/plain');
        }

        function exportToJSON() {
            const exportData = {
                gridSize: gridSize,
                cubes: []
            };
            objects.forEach(obj => {
                if (obj !== plane && obj.geometry && obj.material) {
                    exportData.cubes.push({
                        position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
                        color: obj.material.color.getHex(),
                        uuid: obj.uuid 
                    });
                }
            });
            const jsonString = JSON.stringify(exportData, null, 2);
            downloadFile(jsonString, 'voxel_model.json', 'application/json');
        }

        function importFromJSON(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data.cubes || !data.gridSize) {
                        throw new Error("Invalid JSON format");
                    }

                    clearSelection();
                    while (objects.length > 1) { 
                        const object = objects.pop();
                        if(object !== plane) scene.remove(object);
                    }
                    historyStack.length = 0;
                    redoStack.length = 0;
                    lastPlacedCubePosition = null;

                    applyGridChangeLogic(data.gridSize); 

                    data.cubes.forEach(cubeData => {
                        placeSingleCube(new THREE.Vector3(cubeData.position.x, cubeData.position.y, cubeData.position.z), parseInt(cubeData.color, 16), true);
                    });
                    showMessage("msgImportSuccess");
                } catch (error) {
                    console.error("Error importing JSON:", error);
                    showMessage("msgImportError");
                }
            };
            reader.readAsText(file);
            event.target.value = null; 
        }


        function downloadFile(content, fileName, contentType) {
            const a = document.createElement("a");
            const file = new Blob([content], {type: contentType});
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(a.href);
        }


        function render() {
            renderer.render(scene, camera);
        }

        function animate() {
            requestAnimationFrame(animate);
            if (controls && typeof controls.update === 'function') { 
                 controls.update(); 
            }
            render();
        }
