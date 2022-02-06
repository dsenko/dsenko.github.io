import {DataService} from "../src/services/data-service";
import {DataItem} from "../src/model/data-item";
import {assert} from "chai";

interface MockDataItem extends DataItem {
    name: string;
    list: Array<string>;
}

class MockDataService extends DataService<MockDataItem> {
}

describe('data-service tests', () => {

    let mockDataService: MockDataService = null;

    beforeEach(() => {
        mockDataService = new MockDataService('mock', ['name']);
    });

    it('Add item', async () => {

        let item1: MockDataItem = {
            name: 'test1',
            list: []
        }

        item1 = mockDataService.add(item1);

        assert(mockDataService.getItems().length === 1, 'Item not added')
        assert(item1.key === mockDataService['createKey'](item1), 'Key is not valid');

    });

    it('Get item by key', async () => {

        let item1: MockDataItem = {
            name: 'test1',
            list: []
        }

        item1 = mockDataService.add(item1);

        assert(mockDataService.getByKey(item1.key) !== null, 'Item not exists')

    });

    it('Remove item', async () => {

        let item1: MockDataItem = {
            name: 'test1',
            list: []
        }

        mockDataService.add(item1);
        mockDataService.remove(item1);

        assert(mockDataService.getItems().length === 0, 'Item not removed')

    });

    it('Replace items', async () => {

        let item1: MockDataItem = {
            name: 'test1',
            list: []
        }

        let items: Array<MockDataItem> = [
            {
                name: 'test2',
                list: []
            },
            {
                name: 'test3',
                list: []
            }
        ]

        mockDataService.add(item1);
        mockDataService.replaceItems(items);

        assert(mockDataService.getItems().length === 2, 'Items not replaced')

    });

    it('Regenerate keys', async () => {

        let items: Array<MockDataItem> = [
            {
                name: 'test2',
                list: []
            },
            {
                name: 'test3',
                list: []
            }
        ]

        items = mockDataService.regenerateKeys(items);

        assert(items[0].key === mockDataService['createKey'](items[0]), 'First item key not regenerated')
        assert(items[1].key === mockDataService['createKey'](items[1]), 'Last item key not regenerated')

    });

    it('Listening changes', async () => {

        let item1: MockDataItem = {
            name: 'test1',
            list: []
        }

        const listener = (items: Array<MockDataItem>) => {
            assert(items.length === 1, 'Changes not detected');
        }

        mockDataService.on(listener);
        mockDataService.add(item1);

    });

    it('Unbind listener', async () => {

        const listener = (items: Array<MockDataItem>) => {
        };

        mockDataService.on(listener);
        mockDataService.off(listener);

        assert(mockDataService['listeners'].length === 0, 'Listener not unbounded');

    });

})
